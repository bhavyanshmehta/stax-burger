import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import * as fallbackDb from "@/lib/db-fallback";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { isFallback } = await connectToDatabase();

    if (isFallback) {
      const order = await fallbackDb.getOrderById(id);
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order }, { status: 200 });
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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, message: "Status is required" }, { status: 400 });
    }

    const { isFallback } = await connectToDatabase();

    if (isFallback) {
      const order = await fallbackDb.updateOrderStatus(id, status);
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (error) {
    console.error("API PATCH order status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
