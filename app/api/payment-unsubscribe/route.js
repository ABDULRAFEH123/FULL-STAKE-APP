export async function POST(req) {
    const { subscriptionId, userId } = await req.json();  // Assuming you send these details
  
    try {
      const deleted = await stripe.subscriptions.del(subscriptionId);
  
      // Update user document in MongoDB to deactivate subscription
      await User.updateOne({ _id: userId }, {
        $set: {
          'subscription.active': false,
          'subscription.planId': null,
        }
      });
  
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  