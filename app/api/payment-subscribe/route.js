// /api/payment/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import User from "../../../models/user"; // Make sure to import your User model correctly
import { connectMongoDB } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  await connectMongoDB();
  const { priceId, email } = await req.json();
  console.log(priceId, email, "here PRICE ID AND ALSO THE EMAIL...");

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: process.env.SUCCESS_REDIRECT_STRIPE_LINK,
      cancel_url: process.env.CANCEL_REDIRECT_STRIPE_LINK,
    });

    // Update user document in MongoDB to mark as pending subscription
    const updateResult = await User.updateOne(
      { email: email },
      {
        $set: {
          "subscription.status": "pending", // Assuming 'pending' status for new subscriptions
          "subscription.planId": priceId,
        },
      }
    );

    console.log("Update result:", updateResult);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
