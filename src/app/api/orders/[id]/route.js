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
    const { status, estimatedTime } = body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (estimatedTime !== undefined) updateFields.estimatedTime = estimatedTime;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ success: false, message: "No update parameters provided" }, { status: 400 });
    }

    const { isFallback } = await connectToDatabase();

    if (isFallback) {
      const order = await fallbackDb.updateOrderDetails(id, updateFields);
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    const order = await Order.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
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
