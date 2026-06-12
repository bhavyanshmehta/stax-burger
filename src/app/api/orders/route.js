import { NextResponse } from "next/server";
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
        items: items,
        estimatedTime: orderTime
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
      const order = await fallbackDb.createOrder(body);

      // Save to cart orders list (specifically for checkout prefill fallback)
      const simOrders = JSON.parse(localStorage.getItem("stax_cart_orders") || "[]");
      simOrders.unshift(order);
      localStorage.setItem("stax_cart_orders", JSON.stringify(simOrders));

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

export async function GET() {
  try {
    const hasKeys = isSupabaseConfigured();

    if (hasKeys) {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format database orders mapping
      const formattedOrders = orders.map(ord => ({
        ...ord,
        _id: ord.id, // For tracking routing compatibility
        estimatedTime: ord.estimated_time,
        paymentMethod: ord.payment_method,
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
      const orders = await fallbackDb.getOrders();
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
