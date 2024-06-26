import Stripe from "stripe";
import { NextResponse } from "next/server";
import User from "../../../../models/user"; // Adjust the import based on your directory structure
import { connectMongoDB } from "@/lib/mongodb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.LOCAL_STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  await connectMongoDB();
  console.log("WEBHOOK CALLED");

  const sig = req.headers.get("stripe-signature");
  console.log("Headers:", req.headers);
  console.log("Stripe Signature:", sig);

  if (!sig) {
    console.error("No stripe-signature header value was provided.");
    return NextResponse.json(
      { error: "No stripe-signature header value was provided." },
      { status: 400 }
    );
  }

  let event;

  try {
    const body = await req.text();
    console.log("Raw body:", body);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`Error handling event: ${error.message}`);
    return NextResponse.json(
      { error: `Error handling event: ${error.message}` },
      { status: 500 }
    );
  }
}
const handleSubscriptionCreated = async (subscription) => {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const customerEmail = customer.email;
  const createdDate = new Date(subscription.created * 1000);
  const endingDate = new Date(subscription.current_period_end * 1000);

  const planId = subscription.items.data[0].price.id;

  const updateResult = await User.updateOne(
    { email: customerEmail },
    {
      $set: {
        "subscription.status": subscription.status,
        "subscription.subscriptionId": subscription.id,
        "subscription.createdDate": createdDate,
        "subscription.endingDate": endingDate,
        "subscription.planId": planId,
        "subscription.active": subscription.status === "active",
      },
    }
  );

  console.log(`Updated user with subscription ID: ${subscription.id} created`);
  console.log("Update result:", updateResult);
};

const handleCheckoutSessionCompleted = async (session) => {
  const subscriptionId = session.subscription;
  const customerEmail = session.customer_details.email;

  if (!subscriptionId) {
    console.error("Subscription ID is not available in the session");
    throw new Error("Subscription ID is not available in the session");
  }

  // Retrieve the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const createdDate = new Date(subscription.created * 1000);
  const endingDate = new Date(subscription.current_period_end * 1000);

  // Correctly extract the planId
  const planId = subscription.items.data[0].price.id;
  console.log(planId, "Corrected plan ID...");

  try {
    const planDetails = await stripe.prices.retrieve(planId);
    console.log(planDetails, "Its plainDetails..");
  } catch (error) {
    console.error("Failed to retrieve plan details:", error.message);
    // Handle the error appropriately, perhaps by logging it or setting a default plan name
  }

  // Update the user record with the subscription details and planId
  const updateResult = await User.updateOne(
    { email: customerEmail },
    {
      $set: {
        "subscription.status": "active",
        "subscription.subscriptionId": subscription.id,
        "subscription.createdDate": createdDate,
        "subscription.endingDate": endingDate,
        "subscription.planId": planId, // Store the corrected planId
        "subscription.active": true,
      },
    }
  );

  console.log(`Updated user with subscription ID: ${subscriptionId}`);
  console.log("Update result:", updateResult);
};

const handleInvoicePaymentSucceeded = async (invoice) => {
  const customerEmail = invoice.customer_email;
  const subscriptionId = invoice.subscription;
  const createdDate = new Date(invoice.created * 1000);
  const endingDate = new Date(invoice.lines.data[0].period.end * 1000);

  // Update the user record with the subscription details
  const updateResult = await User.updateOne(
    { email: customerEmail },
    {
      $set: {
        "subscription.status": "active",
        "subscription.subscriptionId": subscriptionId,
        "subscription.createdDate": createdDate,
        "subscription.endingDate": endingDate,
        "subscription.active": true,
      },
    }
  );

  console.log(`Updated user with subscription ID: ${subscriptionId}`);
  console.log("Update result:", updateResult);
};
// Handle failed invoice payments
const handleInvoicePaymentFailed = async (invoice) => {
  const customerEmail = invoice.customer_email;
  const subscriptionId = invoice.subscription;

  // Update the user record to mark the subscription as past_due
  const updateResult = await User.updateOne(
    { email: customerEmail },
    {
      $set: {
        "subscription.status": "past_due",
      },
    }
  );

  console.log(
    `Updated user with subscription ID: ${subscriptionId} to past_due`
  );
  console.log("Update result:", updateResult);
};

// Handle subscription deletions
const handleSubscriptionDeleted = async (subscription) => {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const customerEmail = customer.email;

  // Update the user record to mark the subscription as canceled
  const updateResult = await User.updateOne(
    { email: customerEmail },
    {
      $set: {
        "subscription.status": "canceled",
        "subscription.subscriptionId": null,
        "subscription.planId": null,
        "subscription.endingDate": null,
        "subscription.active": false,
      },
    }
  );

  console.log(
    `Updated user with subscription ID: ${subscription.id} to canceled`
  );
  console.log("Update result:", updateResult);
};

// Handle subscription updates
const handleSubscriptionUpdated = async (subscription) => {
  const customer = await stripe.customers.retrieve(subscription.customer);
  const customerEmail = customer.email;
  const endingDate = new Date(subscription.current_period_end * 1000);

  // Update the user record with the updated subscription details
  const updateResult = await User.updateOne(
    { email: customerEmail },
    {
      $set: {
        "subscription.status": subscription.status,
        "subscription.endingDate": endingDate,
        "subscription.active": subscription.status === "active",
      },
    }
  );

  console.log(
    `Updated user with subscription ID: ${subscription.id} to ${subscription.status}`
  );
  console.log("Update result:", updateResult);
};
