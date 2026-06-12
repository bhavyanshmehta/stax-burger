import { connectToDatabase } from "./db";

/**
 * Dispatch notifications (SMS/Email) to customers when order status changes.
 * Integrates natively with Twilio (SMS) and Resend (Emails).
 * Falls back to local console simulator if credentials are not specified in .env
 */
export async function sendOrderUpdateNotification(order, previousStatus) {
  // If status is unchanged, skip dispatch
  if (previousStatus && order.status === previousStatus) return;

  const phone = order.phone;
  const email = order.email;
  const status = order.status;
  const id = order._id;

  console.log(`[Notification Engine] Processing updates for order ${id}: Status changed to [${status}]`);

  const smsText = getSMSBody(order);
  const emailSubject = `STAX Burger - Order #${id} is ${status}!`;

  // 1. TWILIO SMS GATEWAY
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  ) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const params = new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_FROM_NUMBER,
        Body: smsText,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[SMS Gateway] Sent SMS notification successfully to ${phone}. Message SID: ${data.sid}`);
      } else {
        console.error(`[SMS Gateway Error] Twilio responded with status ${response.status}:`, data);
      }
    } catch (err) {
      console.error(`[SMS Gateway Error] Failed to send SMS via Twilio:`, err);
    }
  } else {
    console.log(`[SMS Simulated Dispatch]\n  To: ${phone}\n  Message: "${smsText}"`);
  }

  // 2. RESEND EMAIL GATEWAY
  if (process.env.EMAIL_API_KEY && process.env.EMAIL_FROM_ADDRESS) {
    try {
      const url = "https://api.resend.com/emails";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM_ADDRESS,
          to: email,
          subject: emailSubject,
          html: getEmailHtml(order),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[Email Gateway] Sent email notification successfully to ${email}. ID: ${data.id}`);
      } else {
        console.error(`[Email Gateway Error] Resend responded with status ${response.status}:`, data);
      }
    } catch (err) {
      console.error(`[Email Gateway Error] Failed to send email via Resend:`, err);
    }
  } else {
    console.log(`[Email Simulated Dispatch]\n  To: ${email}\n  Subject: "${emailSubject}"`);
  }
}

function getSMSBody(order) {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/${order._id}`;
  switch (order.status) {
    case "Received":
      return `Hi ${order.name}, your STAX order #${order._id} is confirmed! Est. delivery: ${order.estimatedTime || "30 mins"}. Track live: ${trackingUrl}`;
    case "Cooking":
      return `Flame grilling in progress! Chef is working on your STAX burger order #${order._id} now.`;
    case "Out for Delivery":
      return `Your STAX order #${order._id} is out for delivery! Our rider is on their way with hot stacks.`;
    case "Delivered":
      return `Enjoy! Your STAX order #${order._id} has been delivered. Thank you for eating premium stack craft!`;
    default:
      return `Your STAX order #${order._id} status is now: ${order.status}`;
  }
}

function getEmailHtml(order) {
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/${order._id}`;
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #0a0a0a; color: #ffffff; border-radius: 20px; border: 1px solid #1a1a1a;">
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #FF7A00;">STAX BURGER CO.</span>
      </div>
      <p style="font-size: 15px; color: #cccccc; line-height: 1.6;">Hi <strong>${order.name}</strong>,</p>
      <p style="font-size: 15px; color: #cccccc; line-height: 1.6;">Your premium burger order has advanced to: <span style="background-color: #FF7A00; color: #000000; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 5px;">${order.status}</span></p>
      
      <div style="background-color: #121212; border: 1px solid #1f1f1f; padding: 20px; border-radius: 12px; margin: 25px 0;">
        <h4 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; color: #FF7A00; letter-spacing: 1px;">Order Summary</h4>
        <p style="margin: 4px 0; font-size: 12px; color: #aaaaaa;"><strong>Order ID:</strong> <span style="font-family: monospace; color: #ffffff;">${order._id}</span></p>
        <p style="margin: 4px 0; font-size: 12px; color: #aaaaaa;"><strong>Estimated Delivery:</strong> <span style="color: #ffffff; font-weight: bold;">${order.estimatedTime || "30 mins"}</span></p>
        <p style="margin: 4px 0; font-size: 12px; color: #aaaaaa;"><strong>Delivery Address:</strong> <span style="color: #ffffff;">${order.address}</span></p>
        <p style="margin: 4px 0; font-size: 12px; color: #aaaaaa;"><strong>Total Amount:</strong> <span style="color: #FF7A00; font-weight: bold;">₹${order.total}</span></p>
      </div>

      <div style="text-align: center; margin: 30px 0 15px 0;">
        <a href="${trackingUrl}" style="background-color: #FF7A00; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 122, 0, 0.3);">Track Live Order</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #1c1c1c; margin: 30px 0;">
      <p style="color: #444444; font-size: 10px; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin: 0;">STAX Burger Co. • Premium Charcoal-Grilled Culinary Craft</p>
    </div>
  `;
}
