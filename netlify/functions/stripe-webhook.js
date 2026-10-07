const Stripe = require('stripe');

const response = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const selectedFieldValue = (fields, key) => {
  const field = fields.find((item) => item.key === key);
  return field && field.text ? field.text.value : '';
};

const invoicePayloadFromSession = (session) => ({
  checkoutSessionId: session.id,
  paymentIntentId: session.payment_intent,
  customerId: session.customer,
  customerEmail: session.customer_details && session.customer_details.email,
  customerName: session.customer_details && session.customer_details.name,
  customerPhone: session.customer_details && session.customer_details.phone,
  billingAddress: session.customer_details && session.customer_details.address,
  fiscalIdentifier: selectedFieldValue(session.custom_fields || [], 'fiscal_identifier'),
  invoiceRecipient: selectedFieldValue(session.custom_fields || [], 'invoice_recipient'),
  invoiceNotes: selectedFieldValue(session.custom_fields || [], 'invoice_notes'),
  products: session.metadata && session.metadata.products,
  amountTotal: session.amount_total,
  currency: session.currency,
  paymentStatus: session.payment_status,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return response(405, { error: 'Metodo non consentito.' });
  if (!process.env.STRIPE_SECRET_KEY) return response(500, { error: 'Stripe non e ancora configurato.' });
  if (!process.env.STRIPE_WEBHOOK_SECRET) return response(500, { error: 'Webhook Stripe non configurato.' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const rawBody = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8');

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe webhook signature error:', error.message);
    return response(400, { error: 'Firma webhook non valida.' });
  }

  try {
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = await stripe.checkout.sessions.retrieve(stripeEvent.data.object.id, {
        expand: ['line_items', 'payment_intent'],
      });

      console.log('SortedBros paid checkout ready for external invoice portal:', invoicePayloadFromSession(session));
    }

    if (stripeEvent.type === 'checkout.session.async_payment_failed') {
      console.warn('SortedBros async checkout payment failed:', {
        checkoutSessionId: stripeEvent.data.object.id,
        customerEmail: stripeEvent.data.object.customer_details && stripeEvent.data.object.customer_details.email,
      });
    }

    if (stripeEvent.type === 'charge.refunded') {
      console.log('SortedBros charge refunded:', {
        chargeId: stripeEvent.data.object.id,
        paymentIntentId: stripeEvent.data.object.payment_intent,
        amountRefunded: stripeEvent.data.object.amount_refunded,
        currency: stripeEvent.data.object.currency,
      });
    }

    return response(200, { received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return response(500, { error: 'Errore gestione webhook.' });
  }
};
