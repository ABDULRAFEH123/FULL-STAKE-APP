import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function GET(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const prices = await stripe.prices.list({
    limit: 99,
    expand: ['data.product'],
  });
  return NextResponse.json(prices.data);
}
