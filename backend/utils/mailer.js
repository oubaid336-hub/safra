const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

async function sendEmail(to, subject, htmlContent) {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: { name: 'Safra', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }]
    });
  } catch (err) {
    // Deliberately swallowed: a broken email integration should never
    // block signup/booking/etc from completing. We just log it.
    console.error('Email send failed:', err.message);
  }
}

module.exports = { sendEmail };
