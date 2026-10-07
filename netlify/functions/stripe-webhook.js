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

const formatMoney = (amount, currency) => {
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: (currency || 'eur').toUpperCase(),
  }).format(amount / 100);
};

const formatAddress = (address) => {
  if (!address) return '';
  return [
    address.line1,
    address.line2,
    [address.postal_code, address.city, address.state].filter(Boolean).join(' '),
    address.country,
  ].filter(Boolean).join(', ');
};

const invoicePayloadFromSession = (session, stripeEvent) => ({
  stripeEventId: stripeEvent.id,
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

const submitOrderToNetlifyForms = async (event, payload) => {
  const siteUrl = process.env.URL || `https://${event.headers.host}`;
  const form = new URLSearchParams({
    'form-name': 'stripe-order',
    subject: `Nuovo ordine Stripe SortedBros - ${payload.products || payload.checkoutSessionId}`,
    checkout_session_id: payload.checkoutSessionId || '',
    stripe_event_id: payload.stripeEventId || '',
    payment_intent_id: typeof payload.paymentIntentId === 'string' ? payload.paymentIntentId : payload.paymentIntentId && payload.paymentIntentId.id || '',
    customer_name: payload.customerName || '',
    email: payload.customerEmail || '',
    phone: payload.customerPhone || '',
    products: payload.products || '',
    amount: formatMoney(payload.amountTotal, payload.currency),
    fiscal_identifier: payload.fiscalIdentifier || '',
    invoice_recipient: payload.invoiceRecipient || '',
    invoice_notes: payload.invoiceNotes || '',
    billing_address: formatAddress(payload.billingAddress),
  });

  const result = await fetch(siteUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!result.ok) {
    throw new Error(`Netlify form submission failed with ${result.status}`);
  }
};

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
      const invoicePayload = invoicePayloadFromSession(session, stripeEvent);

      console.log('SortedBros paid checkout ready for external invoice portal:', invoicePayload);

      try {
        await submitOrderToNetlifyForms(event, invoicePayload);
        console.log('SortedBros order submitted to Netlify Forms:', {
          checkoutSessionId: invoicePayload.checkoutSessionId,
          customerEmail: invoicePayload.customerEmail,
        });
      } catch (error) {
        console.error('SortedBros Netlify form notification error:', error);
      }
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
