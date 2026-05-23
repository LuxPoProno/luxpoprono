// api/create-payment-intent.js
// Fonction serverless pour Vercel → gère les paiements Stripe
const Stripe = require('stripe');

// ⚠️ Sur Vercel, mets ta clé secrète dans les variables d'environnement
// Dans le dashboard Vercel : Settings → Environment Variables → STRIPE_SECRET_KEY
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51TaHWhLXYN8EiWGewWE7Hklccdjq8lhGXAdfyf4j2H014jWg2VQDfKo02lunAANgO4Rb6ouM0TM9UQchkXD8mhWg002twno74c');

module.exports = async (req, res) => {
  // CORS pour autoriser le front-end
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    const { amount, currency, paymentMethodId, plan, period, service, promo, email } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'eur',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      receipt_email: email,
      metadata: {
        plan: plan || '',
        period: period || '',
        service: service || '',
        promo: promo ? 'LUXGRA' : 'none',
      },
      description: `LuxPoProno - ${plan || ''} (${period || ''}) - ${service || ''}`,
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({
      error: err.message || 'Erreur de paiement.',
    });
  }
};
