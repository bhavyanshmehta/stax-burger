import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendOrderUpdateNotification } from "@/lib/notifications";
import * as fallbackDb from "@/lib/db-fallback";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const hasKeys = isSupabaseConfigured();
    const isSimulatedId = id && id.startsWith("stx_");

    if (hasKeys && !isSimulatedId) {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", id)
        .single();

      if (error || !order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }

      // Format order payload for frontend tracking compatibility
      const formattedOrder = {
        ...order,
        _id: order.id,
        estimatedTime: order.estimated_time,
        paymentMethod: order.payment_method,
        items: (order.items || []).map(itm => ({
          name: itm.product_name,
          price: `₹${itm.price}`,
          qty: itm.quantity,
          image: itm.product_image
        }))
      };

      return NextResponse.json({ success: true, order: formattedOrder }, { status: 200 });
    } else {
      // Fallback
      await connectToDatabase();
      const order = await fallbackDb.getOrderById(id);
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order }, { status: 200 });
    }
  } catch (error) {
    console.error("API GET order detail error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order detail" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, estimatedTime } = body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (estimatedTime !== undefined) updateFields.estimated_time = estimatedTime;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: false, message: "No update parameters provided" }, { status: 400 });
    }

    const hasKeys = isSupabaseConfigured();
    const isSimulatedId = id && id.startsWith("stx_");
    let previousStatus = null;
    let order = null;

    if (hasKeys && !isSimulatedId) {
      // Fetch current status before update to check if notifications are needed
      const { data: oldOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", id)
        .single();
      
      if (oldOrder) previousStatus = oldOrder.status;

      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update(updateFields)
        .eq("id", id)
        .select("*, items:order_items(*)")
        .single();

      if (updateError || !updatedOrder) {
        return NextResponse.json({ success: false, message: "Order not found or update failed" }, { status: 404 });
      }

      // Format payload
      order = {
        ...updatedOrder,
        _id: updatedOrder.id,
        estimatedTime: updatedOrder.estimated_time,
        paymentMethod: updatedOrder.payment_method,
        items: (updatedOrder.items || []).map(itm => ({
          name: itm.product_name,
          price: `₹${itm.price}`,
          qty: itm.quantity,
          image: itm.product_image
        }))
      };
    } else {
      // Fallback
      await connectToDatabase();
      const oldOrder = await fallbackDb.getOrderById(id);
      if (oldOrder) previousStatus = oldOrder.status;
      order = await fallbackDb.updateOrderDetails(id, updateFields);
    }

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Trigger order update notification (SMS & Email) asynchronously
    if (status && status !== previousStatus) {
      sendOrderUpdateNotification(order, previousStatus).catch(err => {
        console.error("Failed to send order status update notification:", err);
      });
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error("API PATCH order details error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order details" },
      { status: 500 }
    );
  }
}
