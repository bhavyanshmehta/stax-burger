import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import * as fallbackDb from "@/lib/db-fallback";
import { sendOrderUpdateNotification } from "@/lib/notifications";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      address,
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      profileId,
      paymentDetails
    } = body;

    const hasKeys = isSupabaseConfigured();
    let calculatedTime = "30 mins";

    // 1. Signature Verification for Online Payments
    let paymentStatus = "Pending";
    let transactionId = null;

    if (paymentMethod === "Online") {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentDetails || {};

      if (keySecret && razorpay_signature) {
        if (!razorpay_payment_id || !razorpay_order_id) {
          return NextResponse.json({ success: false, error: "Missing Razorpay payment parameters." }, { status: 400 });
        }

        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(razorpay_order_id + "|" + razorpay_payment_id)
          .digest("hex");

        if (expectedSignature !== razorpay_signature) {
          return NextResponse.json({ success: false, error: "Payment verification failed. Security signature mismatch." }, { status: 400 });
        }

        paymentStatus = "Paid";
        transactionId = razorpay_payment_id;
      } else {
        paymentStatus = "Paid";
        transactionId = (paymentDetails && (paymentDetails.paymentId || paymentDetails.razorpay_payment_id)) || "pay_sim_" + Math.random().toString(36).substring(2, 11);
      }
    } else if (paymentMethod === "Online (Simulated)") {
      paymentStatus = "Paid";
      transactionId = (paymentDetails && (paymentDetails.paymentId || paymentDetails.razorpay_payment_id)) || "pay_sim_" + Math.random().toString(36).substring(2, 11);
    } else if (paymentMethod === "COD") {
      paymentStatus = "COD";
      transactionId = null;
    }

    if (hasKeys) {
      // 1. Calculate dynamic delivery time based on active queue load
      const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["Received", "Preparing", "Cooking", "Out for Delivery"]);

      const activeCount = count || 0;
      if (activeCount <= 1) {
        calculatedTime = "20 mins";
      } else if (activeCount <= 3) {
        calculatedTime = "30 mins";
      } else if (activeCount <= 5) {
        calculatedTime = "45 mins";
      } else {
        calculatedTime = "60 mins";
      }

      const orderTime = body.estimatedTime || calculatedTime;

      // 2. Insert order details in orders table
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          profile_id: profileId || null,
          name,
          email,
          phone,
          address,
          payment_method: paymentMethod,
          subtotal,
          tax,
          total,
          status: "Received",
          estimated_time: orderTime,
          payment_status: paymentStatus,
          transaction_id: transactionId,
          payment_details: paymentDetails || null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Insert order items in order_items table
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        price: parseInt(item.price.toString().replace("₹", "")),
        quantity: item.qty,
        product_image: item.image
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Format order payload for notifications compat
      const formattedOrder = {
        ...order,
        _id: order.id,
        items: items,
        estimatedTime: orderTime,
        paymentStatus,
        transactionId
      };

      // Dispatch notifications
      sendOrderUpdateNotification(formattedOrder, null).catch(err => {
        console.error("Failed to trigger order confirmation notification:", err);
      });

      return NextResponse.json({ success: true, order: formattedOrder, isFallback: false }, { status: 201 });
    } else {
      // --- Fallback Local Database ---
      const { isFallback } = await connectToDatabase();
      const orders = await fallbackDb.getOrders();
      const activeCount = orders.filter(o => 
        ["Received", "Preparing", "Cooking", "Out for Delivery"].includes(o.status)
      ).length;

      if (activeCount <= 1) {
        calculatedTime = "20 mins";
      } else if (activeCount <= 3) {
        calculatedTime = "30 mins";
      } else if (activeCount <= 5) {
        calculatedTime = "45 mins";
      } else {
        calculatedTime = "60 mins";
      }

      body.estimatedTime = calculatedTime;
      body.paymentStatus = paymentStatus;
      body.transactionId = transactionId;
      const order = await fallbackDb.createOrder(body);

      sendOrderUpdateNotification(order, null).catch(err => {
        console.error("Failed to trigger order confirmation notification:", err);
      });

      return NextResponse.json({ success: true, order, isFallback: true }, { status: 201 });
    }
  } catch (error) {
    console.error("API POST orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to place order" },
      { status: 400 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const email = searchParams.get("email");
    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      let query = supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (profileId && email) {
        query = query.or(`profile_id.eq.${profileId},email.eq.${email}`);
      } else if (profileId) {
        query = query.eq("profile_id", profileId);
      } else if (email) {
        query = query.eq("email", email);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Format database orders mapping
      const formattedOrders = orders.map(ord => ({
        ...ord,
        _id: ord.id, // For tracking routing compatibility
        estimatedTime: ord.estimated_time,
        paymentMethod: ord.payment_method,
        paymentStatus: ord.payment_status,
        transactionId: ord.transaction_id,
        items: (ord.items || []).map(itm => ({
          name: itm.product_name,
          price: `₹${itm.price}`,
          qty: itm.quantity,
          image: itm.product_image
        }))
      }));

      return NextResponse.json({ success: true, orders: formattedOrders, isFallback: false }, { status: 200 });
    } else {
      // Fallback
      await connectToDatabase();
      let orders = await fallbackDb.getOrders();

      if (profileId || email) {
        orders = orders.filter(o => 
          (profileId && o.profileId === profileId) || 
          (email && o.email === email)
        );
      }

      return NextResponse.json({ success: true, orders, isFallback: true }, { status: 200 });
    }
  } catch (error) {
    console.error("API GET orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
