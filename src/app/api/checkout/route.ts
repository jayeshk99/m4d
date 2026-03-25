import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    // Validate amount (in dollars)
    const dollars = Number(amount);
    if (!dollars || dollars < 1 || dollars > 10000) {
      return Response.json(
        { error: "Please enter an amount between $1 and $10,000" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create a Price with custom_unit_amount, then use it in the session
    const price = await stripe.prices.create({
      currency: "aud",
      product: process.env.STRIPE_PRODUCT_ID!,
      custom_unit_amount: {
        enabled: true,
        preset: Math.round(dollars * 100), // Pre-fill with selected amount (in cents)
        minimum: 100, // Minimum $1
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}?donated=true`,
      cancel_url: baseUrl,
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return Response.json({ error: message }, { status: 500 });
  }
}
