// /api/stripe-webhook/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import User from '../../../models/user'; // Adjust the import based on your directory structure
import { connectMongoDB } from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  await connectMongoDB();
  console.log('WEBHOOK CALLED');

  const sig = req.headers.get('stripe-signature');
  console.log('Headers:', req.headers);
  console.log('Stripe Signature:', sig);

  if (!sig) {
    console.error('No stripe-signature header value was provided.');
    return NextResponse.json({ error: 'No stripe-signature header value was provided.' }, { status: 400 });
  }

  let event;

  try {
    const body = await req.text();
    console.log('Raw body:', body);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const subscriptionId = session.subscription;
        const customerEmail = session.customer_details.email;

        if (!subscriptionId) {
          console.error('Subscription ID is not available in the session');
          return NextResponse.json({ error: 'Subscription ID is not available in the session' }, { status: 400 });
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
          console.log(planDetails,'Its plainDetails..')
       
        } catch (error) {
          console.error("Failed to retrieve plan details:", error.message);
          // Handle the error appropriately, perhaps by logging it or setting a default plan name
         
        }

        // Update the user record with the subscription details and planId
        const updateResult = await User.updateOne(
          { email: customerEmail },
          {
            $set: {
              'subscription.status': 'active',
              'subscription.subscriptionId': subscription.id,
              'subscription.createdDate': createdDate,
              'subscription.endingDate': endingDate,
              'subscription.planId': planId, // Store the corrected planId
        
              'subscription.active': true,
            },
          }
        );

        console.log(`Updated user with subscription ID: ${subscriptionId}`);
        console.log('Update result:', updateResult);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        const customerEmailInvoice = invoice.customer_email;
        const subscriptionIdInvoice = invoice.subscription;
        const createdDateInvoice = new Date(invoice.created * 1000);
        const endingDateInvoice = new Date(invoice.lines.data[0].period.end * 1000);

        // Update the user record with the subscription details
        const updateResultInvoice = await User.updateOne(
          { email: customerEmailInvoice },
          {
            $set: {
              'subscription.status': 'active',
              'subscription.subscriptionId': subscriptionIdInvoice,
              'subscription.createdDate': createdDateInvoice,
              'subscription.endingDate': endingDateInvoice,
              'subscription.active': true,
            },
          }
        );

        console.log(`Updated user with subscription ID: ${subscriptionIdInvoice}`);
        console.log('Update result:', updateResultInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`Error handling event: ${error.message}`);
    return NextResponse.json({ error: `Error handling event: ${error.message}` }, { status: 500 });
  }
}

