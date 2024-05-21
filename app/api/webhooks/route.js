export async function handleWebhook(req) {
    const event = req.body;
  
    // Verify event by fetching it directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
  
    if (session.payment_status === "paid") {
      await User.updateOne(
        { "subscription.planId": session.line_items.data[0].price.id },
        {
          $set: {
            "subscription.active": true,
            "subscription.pending": false
          },
        }
      );
    }
  }
  