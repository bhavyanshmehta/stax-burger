import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import * as fallbackDb from "@/lib/db-fallback";

export async function POST(req) {
  try {
    const body = await req.json();
    const { isFallback } = await connectToDatabase();

    if (isFallback) {
      const order = await fallbackDb.createOrder(body);
      return NextResponse.json({ success: true, order }, { status: 201 });
    }

    const order = await Order.create(body);
    return NextResponse.json({ success: true, order }, { status: 201 });
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
      return NextResponse.json({ success: true, orders }, { status: 200 });
    }

    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("API GET orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
