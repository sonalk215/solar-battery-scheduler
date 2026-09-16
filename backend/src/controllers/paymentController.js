const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { jobId, customerName, amount } = req.body;

    // Validate incoming data
    if (!jobId || !amount) {
      return res
        .status(400)
        .json({ error: 'Missing required job ID or payment amount.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud', // Australian Dollars
            product_data: {
              name: `Battery Installation Deposit - Job ${jobId}`,
              description: `Booking deposit for customer ${
                customerName || 'Valued Customer'
              }`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${
        req.headers.origin || 'http://localhost:5173'
      }/schedule?success=true&job=${jobId}`,
      cancel_url: `${
        req.headers.origin || 'http://localhost:5173'
      }/schedule?canceled=true`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
};
