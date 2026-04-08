import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Razorpay and Resend lazily to avoid crashing if keys are missing
  let razorpay: Razorpay | null = null;
  let resend: Resend | null = null;

  function getRazorpay() {
    if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });
    }
    return razorpay;
  }

  function getResend() {
    if (!resend && process.env.RESEND_API_KEY) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
  }

  // Webhook needs raw body for signature verification
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!webhookSecret || !signature) {
      return res.status(400).send("Missing signature or webhook secret");
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    try {
      const event = JSON.parse(req.body.toString());

      if (event.event === "order.paid" || event.event === "payment.captured") {
        const customerEmail = event.payload.payment.entity.email;
        
        if (customerEmail) {
          const resendClient = getResend();
          if (resendClient) {
            try {
              await resendClient.emails.send({
                from: "The Capital Guru <onboarding@resend.dev>",
                to: customerEmail,
                subject: "Welcome to The Capital Guru - Your Access Link",
                html: `
                  <div style="font-family: sans-serif; color: #121212;">
                    <h1 style="color: #00FF66; background: #121212; padding: 20px;">The Capital Guru</h1>
                    <h2>Payment Successful!</h2>
                    <p>Welcome to the elite trading community. Your subscription is now active.</p>
                    <p>Click the link below to join our private Telegram channel:</p>
                    <a href="${process.env.TELEGRAM_INVITE_LINK || '#'}" style="display: inline-block; background: #00FF66; color: #121212; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Join Telegram Channel</a>
                    <p>If you have any issues, please reply to this email.</p>
                  </div>
                `,
              });
              console.log(`Sent invite email to ${customerEmail}`);
            } catch (error) {
              console.error("Error sending email:", error);
            }
          } else {
            console.error("Resend not configured, could not send email.");
          }
        }
      }
      res.json({ status: "ok" });
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Standard JSON parsing for other routes
  app.use(express.json());

  app.post("/api/create-razorpay-order", async (req, res) => {
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(500).json({ error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_SECRET to your environment variables." });
    }

    try {
      const { planId, price } = req.body;
      
      const options = {
        amount: price * 100, // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}_${planId}`,
      };

      const order = await rzp.orders.create(options);
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
