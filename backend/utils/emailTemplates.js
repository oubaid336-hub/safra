function emailShell({ bodyHtml, footerHtml }) {
  return `
  <div style="background-color:#F3E6D1; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="background-color:#ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(20,33,61,0.12);">
        <div style="background-color:#14213D; padding: 28px 32px; text-align:center;">
          <span style="font-family: Georgia, 'Times New Roman', serif; font-weight:bold; font-size:24px; color:#F3E6D1; letter-spacing:0.5px;">Safra</span>
        </div>
        <div style="padding: 36px 32px; font-family: Arial, Helvetica, sans-serif;">
          ${bodyHtml}
        </div>
        <div style="background-color:#FAF7F2; padding: 20px 32px; text-align:center; border-top:1px solid #EFE3CF;">
          ${footerHtml || '<p style="color:#9AA5B1;font-size:12px;margin:0;">Safra Tunisia\'s marketplace for houses and cars.</p>'}
        </div>
      </div>
    </div>
  </div>
  `;
}

function ctaButton(url, label) {
  return `
  <p style="text-align:center;margin:32px 0 8px;">
    <a href="${url}" style="background-color:#C1502E;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;font-weight:bold;display:inline-block;">${label}</a>
  </p>`;
}

function detailRow(label, value, opts = {}) {
  const { bold, accent, noBorder } = opts;
  const border = noBorder ? '' : 'border-bottom:1px solid #EFE3CF;';
  const valueColor = accent ? '#C1502E' : '#14213D';
  const valueWeight = bold ? 'bold' : 'normal';
  const valueSize = bold ? '17px' : '14px';
  return `
    <tr>
      <td style="padding: 10px 0; ${border} color: #7C8797; font-size: 14px;">${label}</td>
      <td style="padding: 10px 0; ${border} color: ${valueColor}; font-size: ${valueSize}; font-weight: ${valueWeight}; text-align: right;">${value}</td>
    </tr>`;
}

function buildCustomerBookingEmail({ customerName, listingTitle, listingLocation, listingType, startDate, endDate, days, unit, totalPrice, adminEmail }) {
  const typeLabel = listingType === 'house' ? 'House' : 'Car';
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">Your booking is confirmed!</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px;">Hi ${customerName},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">Thanks for booking with Safra. Here are your reservation details:</p>
    <table style="width:100%;border-collapse:collapse;">
      ${detailRow(typeLabel, listingTitle, { bold: true })}
      ${detailRow('Location', listingLocation)}
      ${detailRow('Check-in', startDate)}
      ${detailRow('Check-out', endDate)}
      ${detailRow('Duration', `${days} ${unit}${days > 1 ? 's' : ''}`)}
      ${detailRow('Total price', `$${totalPrice}`, { bold: true, accent: true, noBorder: true })}
    </table>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:24px;">If anything looks wrong or you need to make changes, just reply to this email or reach us directly at <a href="mailto:${adminEmail}" style="color:#C1502E;">${adminEmail}</a>.</p>
  `;
  return emailShell({ bodyHtml: body });
}

function buildAdminBookingEmail({ customerName, customerEmail, listingTitle, listingLocation, listingType, startDate, endDate, days, totalPrice }) {
  const typeLabel = listingType === 'house' ? 'House' : 'Car';
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">New Booking Received</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">A new booking just came in on Safra:</p>
    <table style="width:100%;border-collapse:collapse;">
      ${detailRow('Customer', `${customerName} (${customerEmail})`)}
      ${detailRow(typeLabel, listingTitle, { bold: true })}
      ${detailRow('Location', listingLocation)}
      ${detailRow('Dates', `${startDate} to ${endDate} (${days} day${days > 1 ? 's' : ''})`)}
      ${detailRow('Total price', `$${totalPrice}`, { bold: true, accent: true, noBorder: true })}
    </table>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:24px;">Log into the admin panel to review or manage this booking.</p>
  `;
  return emailShell({ bodyHtml: body });
}

function buildVerificationEmail({ name, verifyUrl }) {
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">Verify your email</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px;">Hi ${name},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">Welcome to Safra! Click below to verify your account. This link expires in 24 hours.</p>
    ${ctaButton(verifyUrl, 'Verify Account')}
  `;
  return emailShell({ bodyHtml: body });
}

function buildPasswordResetEmail({ name, resetUrl }) {
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">Reset your password</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px;">Hi ${name},</p>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">We received a request to reset your Safra password. Click below to choose a new one. This link expires in 1 hour.</p>
    ${ctaButton(resetUrl, 'Reset Password')}
    <p style="color:#9AA5B1;font-size:13px;line-height:1.6;margin-top:8px;">If you didn't request this, you can safely ignore this email your password won't change.</p>
  `;
  return emailShell({ bodyHtml: body });
}

function buildWelcomeEmail({ name, frontendUrl }) {
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">Welcome to Safra, ${name}!</h2>
    <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">Your account is verified and ready to go. Start browsing houses and cars available to book right now.</p>
    ${ctaButton(frontendUrl, 'Browse Listings')}
    <p style="color:#9AA5B1;font-size:13px;line-height:1.6;margin-top:8px;">Questions? Just reply to this email, we're happy to help.</p>
  `;
  return emailShell({ bodyHtml: body });
}

function buildContactNotificationEmail({ name, email, message }) {
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">New Contact Message</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      ${detailRow('From', `${name} (${email})`, { noBorder: true })}
    </table>
    <p style="color:#7C8797;font-size:13px;margin-bottom:6px;">Message:</p>
    <p style="color:#14213D;font-size:15px;line-height:1.6;white-space:pre-wrap;background-color:#FAF7F2;padding:16px;border-radius:8px;">${message}</p>
    <p style="color:#374151;font-size:14px;line-height:1.6;margin-top:24px;">Log into the admin panel to view and mark this message as handled.</p>
  `;
  return emailShell({ bodyHtml: body });
}

function buildListingBroadcastEmail({ listingTitle, listingLocation, listingType, price, priceUnit, frontendUrl, unsubscribeUrl }) {
  const typeLabel = listingType === 'house' ? 'House' : 'Car';
  const body = `
    <h2 style="color:#14213D;font-family:Georgia,serif;font-size:21px;margin:0 0 16px;">New ${typeLabel} Just Listed</h2>
    <table style="width:100%;border-collapse:collapse;">
      ${detailRow(typeLabel, listingTitle, { bold: true })}
      ${detailRow('Location', listingLocation)}
      ${detailRow('Price', `$${price} / ${priceUnit}`, { accent: true, noBorder: true })}
    </table>
    ${ctaButton(frontendUrl, 'View Listing')}
  `;
  const footer = `
    <p style="color:#9AA5B1;font-size:12px;margin:0 0 8px;">Safra new listing alert.</p>
    <p style="color:#9AA5B1;font-size:12px;margin:0;"><a href="${unsubscribeUrl}" style="color:#9AA5B1;">Unsubscribe</a></p>
  `;
  return emailShell({ bodyHtml: body, footerHtml: footer });
}

module.exports = { buildCustomerBookingEmail, buildAdminBookingEmail, buildPasswordResetEmail, buildWelcomeEmail, buildVerificationEmail, buildContactNotificationEmail, buildListingBroadcastEmail };
