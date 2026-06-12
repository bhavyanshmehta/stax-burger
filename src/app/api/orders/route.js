import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import * as fallbackDb from "@/lib/db-fallback";
import { sendOrderUpdateNotification } from "@/lib/notifications";

export async function POST(req) {
  try {
    const body = await req.json();
    const { isFallback } = await connectToDatabase();

    // 1. Calculate dynamic delivery time based on active queue load
    let activeCount = 0;
    if (isFallback) {
      const orders = await fallbackDb.getOrders();
      activeCount = orders.filter(o => 
        ["Received", "Cooking", "Out for Delivery"].includes(o.status)
      ).length;
    } else {
      activeCount = await Order.countDocuments({
        status: { $in: ["Received", "Cooking", "Out for Delivery"] }
      });
    }

    // Dynamic estimation presets based on active queue size:
    // 0-1 orders: 20 mins
    // 2-3 orders: 30 mins
    // 4-5 orders: 45 mins
    // 6+ orders: 60 mins
    let calculatedTime = "30 mins";
    if (activeCount <= 1) {
      calculatedTime = "20 mins";
    } else if (activeCount <= 3) {
      calculatedTime = "30 mins";
    } else if (activeCount <= 5) {
      calculatedTime = "45 mins";
    } else {
      calculatedTime = "60 mins";
    }

    // Apply computed time if not custom set
    if (!body.estimatedTime) {
      body.estimatedTime = calculatedTime;
    }

    let order;
    if (isFallback) {
      order = await fallbackDb.createOrder(body);
    } else {
      order = await Order.create(body);
    }

    // Dispatch async notifications (non-blocking)
    sendOrderUpdateNotification(order, null).catch(err => {
      console.error("Failed to trigger order confirmation notification:", err);
    });

    return NextResponse.json({ success: true, order, isFallback }, { status: 201 });
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
    const { isFallback } = await connectToDatabase();

    if (isFallback) {
      const orders = await fallbackDb.getOrders();
      return NextResponse.json({ success: true, orders, isFallback: true }, { status: 200 });
    }

    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders, isFallback: false }, { status: 200 });
  } catch (error) {
    console.error("API GET orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
