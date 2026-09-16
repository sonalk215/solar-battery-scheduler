import { useState } from 'react';

const CheckoutButton = ({ job }) => {
  const [loading, setLoading] = useState(false);
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleCheckout = async () => {
    setLoading(true);
    try {
      console.log(baseURL);
      const response = await fetch(
        `${baseURL}/payments/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.job_id,
            customerName: job.customer_name,
            amount: 150,
          }),
        }
      );
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirects user to Stripe Checkout page
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
    >
      {loading ? 'Processing...' : 'Collect Deposit ($150)'}
    </button>
  );
};

export default CheckoutButton;
