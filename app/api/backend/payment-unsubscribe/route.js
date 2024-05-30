import Stripe from "stripe";
import { NextResponse } from "next/server";
import User from "../../../../models/user"; // Make sure to import your User model correctly
import { connectMongoDB } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  await connectMongoDB();
  const { subscriptionId, email } = await req.json(); // Using email instead of userId


  try {
    // Cancel the subscription from Stripe
    const deleted = await stripe.subscriptions.cancel(subscriptionId);
    console.log(deleted, "its deleted user subscription..");
    
    // Update user document in MongoDB to deactivate subscription
    const updateResult = await User.updateOne(
      { email: email },
      {
        $set: {
          "subscription.status":"inactive",
          "subscription.active": false,
          "subscription.planId": null,
          "subscription.pending": false,
          "subscription.subscriptionId": null, 
          "subscription.createdDate":null,
          "subscription.endingDate":null,

        },
      },
    );

    console.log("Update result:", updateResult);

    return NextResponse.json({message:"Subscription Removed SuccessFully.."},{ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
