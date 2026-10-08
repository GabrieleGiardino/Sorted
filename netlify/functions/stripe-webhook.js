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

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

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

const customerEmailHtml = (payload) => {
  const product = escapeHtml(payload.products || 'il tuo acquisto');
  const amount = escapeHtml(formatMoney(payload.amountTotal, payload.currency));
  const sessionId = escapeHtml(payload.checkoutSessionId);
  const logoUrl = 'https://sortedbros.com/assets/email-logo-sortedbros-white.png?v=1';

  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Grazie per il tuo acquisto</title>
  </head>
  <body style="margin:0;background:#f4f3ef;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e2da;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:30px 30px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;background:#111827;border-radius:14px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <img src="${logoUrl}" width="170" alt="SortedBros" style="display:block;max-width:170px;height:auto;">
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px;color:#6b7280;font-size:13px;letter-spacing:.08em;text-transform:uppercase;">Ordine confermato</p>
                <h1 style="margin:0 0 16px;color:#111827;font-size:30px;line-height:1.15;">Grazie per il tuo acquisto.</h1>
                <p style="margin:0 0 18px;color:#374151;font-size:16px;line-height:1.6;">Abbiamo ricevuto correttamente il pagamento per <strong>${product}</strong>. Ti contatteremo presto per raccogliere i dettagli operativi e avviare il lavoro.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border-collapse:collapse;background:#f8fafc;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;color:#6b7280;font-size:13px;">Prodotto</td>
                    <td align="right" style="padding:16px 18px;color:#111827;font-size:14px;font-weight:700;">${product}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 16px;color:#6b7280;font-size:13px;">Totale pagato</td>
                    <td align="right" style="padding:0 18px 16px;color:#111827;font-size:14px;font-weight:700;">${amount}</td>
                  </tr>
                </table>
                <p style="margin:0 0 14px;color:#374151;font-size:15px;line-height:1.6;">Per fattura e documenti fiscali useremo i dati inseriti nel checkout. Se noti qualcosa da correggere, rispondi direttamente a questa email.</p>
                <p style="margin:22px 0 0;color:#6b7280;font-size:12px;line-height:1.5;">Riferimento ordine: ${sessionId}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 30px;background:#111827;color:#d1d5db;font-size:13px;line-height:1.6;">
                <strong style="color:#ffffff;">SortedBros</strong><br>
                Web agency a Parma<br>
                <a href="mailto:info@sortedbros.com" style="color:#5af0df;text-decoration:none;">info@sortedbros.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const customerEmailText = (payload) => [
  'Grazie per il tuo acquisto.',
  '',
  `Abbiamo ricevuto correttamente il pagamento per ${payload.products || 'il tuo acquisto'}.`,
  `Totale pagato: ${formatMoney(payload.amountTotal, payload.currency)}`,
  '',
  'Ti contatteremo presto per raccogliere i dettagli operativi e avviare il lavoro.',
  'Per fattura e documenti fiscali useremo i dati inseriti nel checkout.',
  '',
  `Riferimento ordine: ${payload.checkoutSessionId}`,
  '',
  'SortedBros',
  'info@sortedbros.com',
].join('\n');

const sendCustomerOrderEmail = async (payload) => {
  if (!payload.customerEmail) {
    console.warn('SortedBros customer email skipped: missing customer email.');
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('SortedBros customer email skipped: RESEND_API_KEY is not configured.');
    return;
  }

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `sortedbros-customer-${payload.checkoutSessionId}`,
    },
    body: JSON.stringify({
      from: process.env.ORDER_EMAIL_FROM || 'SortedBros <info@sortedbros.com>',
      to: [payload.customerEmail],
      reply_to: process.env.ORDER_EMAIL_REPLY_TO || 'info@sortedbros.com',
      subject: `Grazie per il tuo acquisto - ${payload.products || 'SortedBros'}`,
      html: customerEmailHtml(payload),
      text: customerEmailText(payload),
      tags: [
        { name: 'source', value: 'sortedbros-shop' },
        { name: 'checkout_session', value: payload.checkoutSessionId },
      ],
    }),
  });

  if (!result.ok) {
    const details = await result.text();
    throw new Error(`Resend customer email failed with ${result.status}: ${details}`);
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

      try {
        await sendCustomerOrderEmail(invoicePayload);
        console.log('SortedBros customer order email processed:', {
          checkoutSessionId: invoicePayload.checkoutSessionId,
          customerEmail: invoicePayload.customerEmail,
        });
      } catch (error) {
        console.error('SortedBros customer email error:', error);
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
