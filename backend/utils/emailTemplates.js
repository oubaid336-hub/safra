function buildCustomerBookingEmail({ customerName, listingTitle, listingLocation, listingType, startDate, endDate, days, unit, totalPrice, adminEmail }) {
  const typeLabel = listingType === 'house' ? 'House' : 'Car';
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #0f766e; padding: 24px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Safra</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Your booking is confirmed!</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hi ${customerName},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">Thanks for booking with Safra. Here are your reservation details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">${typeLabel}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right; font-weight: bold;">${listingTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Location</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${listingLocation}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Check-in</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${startDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Check-out</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${endDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Duration</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${days} ${unit}${days > 1 ? 's' : ''}</td>
        </tr>
        <tr>
          <td style="padding: 14px 0 0 0; color: #111827; font-size: 16px; font-weight: bold;">Total price</td>
          <td style="padding: 14px 0 0 0; color: #0f766e; font-size: 18px; font-weight: bold; text-align: right;">$${totalPrice}</td>
        </tr>
      </table>
      <p style="color: #374151; font-size: 14px; line-height: 1.5;">If anything looks wrong or you need to make changes, just reply to this email or reach us directly at <a href="mailto:${adminEmail}" style="color: #0f766e;">${adminEmail}</a>.</p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Safra — this is an automated confirmation email.</p>
    </div>
  </div>
  `;
}

function buildAdminBookingEmail({ customerName, customerEmail, listingTitle, listingLocation, listingType, startDate, endDate, days, totalPrice }) {
  const typeLabel = listingType === 'house' ? 'House' : 'Car';
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #111827; padding: 24px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Booking Received</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">A new booking just came in on Safra:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Customer</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${customerName} (${customerEmail})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">${typeLabel}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right; font-weight: bold;">${listingTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Location</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${listingLocation}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Dates</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${startDate} → ${endDate} (${days} day${days > 1 ? 's' : ''})</td>
        </tr>
        <tr>
          <td style="padding: 14px 0 0 0; color: #111827; font-size: 16px; font-weight: bold;">Total price</td>
          <td style="padding: 14px 0 0 0; color: #0f766e; font-size: 18px; font-weight: bold; text-align: right;">$${totalPrice}</td>
        </tr>
      </table>
      <p style="color: #374151; font-size: 14px; line-height: 1.5;">Log into the admin panel to review or manage this booking.</p>
    </div>
  </div>
  `;
}


function buildPasswordResetEmail({ name, resetUrl }) {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #0f766e; padding: 24px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Safra</h1>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Reset your password</h2>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hi ${name},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">We received a request to reset your Safra password. Click the button below to choose a new one. This link expires in 1 hour.</p>
      <p style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 15px; font-weight: bold; display: inline-block;">Reset Password</a>
      </p>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
    </div>
    <div style="background-color: #f9fafb; padding: 20px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Safra — this is an automated security email.</p>
    </div>
  </div>
  `;
}

module.exports = { buildCustomerBookingEmail, buildAdminBookingEmail, buildPasswordResetEmail }; // ADMIN_MARKER_resetemail
