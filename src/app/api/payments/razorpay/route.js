import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { amount } = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if credentials are present. If not, return error
    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        error: "Razorpay payment gateway credentials are not configured on the server."
      }, { status: 400 });
    }

    // Razorpay amount is in paise (e.g. ₹100 = 10000 paise)
    const razorpayAmount = Math.round(parseFloat(amount) * 100);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: razorpayAmount,
        currency: "INR",
        receipt: "rcpt_stx_" + Math.random().toString(36).substring(2, 11),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay API order creation error details:", data);
      return NextResponse.json({
        success: false,
        error: data.error?.description || "Razorpay API error"
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      isSimulated: false,
      keyId,
      order: data
    }, { status: 200 });
  } catch (error) {
    console.error("Razorpay API order creation error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to initiate payment order"
    }, { status: 500 });
  }
}
