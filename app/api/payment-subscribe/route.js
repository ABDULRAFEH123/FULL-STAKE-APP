// /api/paymnet/route.js
// /api/payment/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import User from "../../../models/user";  // Make sure to import your User model correctly
import { connectMongoDB } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    await connectMongoDB();
  const { priceId, email } = await req.json(); // Now using email instead of userId
  console.log(priceId, email, "here PRICE ID AND ALSO THE EMAIL...");

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `http://localhost:3000/home`,
      cancel_url: `http://localhost:3000/home`,
    });
    console.log(session, "it's the session of the Stripe.");
    
  
    // Update user document in MongoDB to mark as pending subscription
      // Perform the update operation
      const updateResult = await User.updateOne(
        { email: email },
        {
            $set: {
                "subscription.active": false,  // Active should be false initially
                "subscription.pending": true,  // Indicate that payment is pending
                "subscription.planId": priceId,
              },
        }
    );

    console.log("Update result:", updateResult);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
