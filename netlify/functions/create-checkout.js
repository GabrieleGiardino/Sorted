const Stripe = require('stripe');

// The browser only sends product names. Prices always come from this server-side catalog.
// Amounts are final customer prices for the current Italian forfettario setup.
const catalog = Object.freeze({
  'Landing che converte': { amount: 30000, category: 'web' },
  'Sito business': { amount: 50000, category: 'web' },
  'Video e-commerce': { amount: 25000, category: 'content' },
  'Targhetta recensioni Google': { amount: 2900, category: 'physical' },
  'Video promo': { amount: 18000, category: 'content' },
  'Animazione per social': { amount: 12000, category: 'content' },
  'Google Business boost': { amount: 15000, category: 'consulting' },
  'E-commerce completo': { amount: 300000, category: 'web' },
  'Agenda e prenotazioni': { amount: 150000, category: 'web' },
});

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return response(405, { error: 'Metodo non consentito.' });

  let items;
  try {
    ({ items } = JSON.parse(event.body || '{}'));
  } catch {
    return response(400, { error: 'Carrello non valido.' });
  }

  if (!Array.isArray(items) || !items.length) return response(400, { error: 'Il carrello e vuoto.' });

  const invalidItem = items.find((item) => typeof item !== 'string' || !catalog[item]);
  if (invalidItem) return response(400, { error: 'Uno dei prodotti non e disponibile.' });
  if (!process.env.STRIPE_SECRET_KEY) return response(500, { error: 'Stripe non e ancora configurato.' });

  const siteUrl = process.env.URL || `https://${event.headers.host}`;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const products = items.map((name) => ({ name, ...catalog[name] }));
  const productsSummary = products.map((product) => product.name).join(' | ').slice(0, 500);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'it',
      billing_address_collection: 'required',
      customer_creation: 'always',
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      custom_fields: [
        {
          key: 'fiscal_identifier',
          label: { type: 'custom', custom: 'Codice fiscale o P.IVA' },
          type: 'text',
          text: { maximum_length: 32 },
        },
        {
          key: 'invoice_recipient',
          label: { type: 'custom', custom: 'PEC o codice destinatario' },
          optional: true,
          type: 'text',
          text: { maximum_length: 80 },
        },
        {
          key: 'invoice_notes',
          label: { type: 'custom', custom: 'Dati fattura / note' },
          optional: true,
          type: 'text',
          text: { maximum_length: 200 },
        },
      ],
      line_items: products.map((product) => ({
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: product.amount,
          product_data: {
            name: `SortedBros - ${product.name}`,
            metadata: { category: product.category },
          }
        }
      })),
      success_url: `${siteUrl}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop/?checkout=cancelled`,
      metadata: {
        source: 'sortedbros-shop',
        fiscal_flow: 'external-invoice-portal',
        products: productsSummary,
      },
      payment_intent_data: {
        metadata: {
          source: 'sortedbros-shop',
          fiscal_flow: 'external-invoice-portal',
          products: productsSummary,
        },
      },
    });

    return response(200, { url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    return response(500, { error: 'Non siamo riusciti ad avviare il pagamento. Riprova tra poco.' });
  }
};
