const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

const shell = (preheader, content) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <title>Rent Nest</title>
    </head>
    <body style="margin:0;padding:0;background:#F4F0E7;color:#141413;font-family:Arial,Helvetica,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F4F0E7">
        <tr>
          <td align="center" style="padding:36px 14px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px">
              <tr>
                <td style="padding:0 10px 12px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#141413;border-radius:20px 20px 0 0">
                    <tr>
                      <td style="padding:24px 28px">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td valign="middle" align="center" style="width:42px;height:42px;border-radius:14px;background:#D4AF37;color:#141413;font-size:20px;font-weight:bold">R</td>
                            <td valign="middle" style="padding-left:12px;color:#F5F0E6;font-size:20px;font-weight:bold;letter-spacing:.2px">Rent Nest<span style="display:block;padding-top:4px;color:#D4AF37;font-size:10px;font-weight:normal;letter-spacing:2px;text-transform:uppercase">Luxury Estates</span></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 10px">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFFFF;border:1px solid #E5DEC9;border-radius:20px;box-shadow:0 14px 30px rgba(20,20,19,.08)">
                    <tr><td style="height:4px;background:linear-gradient(90deg,#C59B27,#D4AF37)"></td></tr>
                    <tr><td style="padding:36px 32px 32px">${content}</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:22px 20px 0;color:#81796D;font-size:11px;line-height:1.7">&copy; ${new Date().getFullYear()} Rent Nest &middot; Your home, thoughtfully managed</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const emailTemp = ({ otp, resetLink, title, message, details }) => {
  if (resetLink) {
    const content = `
      <div style="display:inline-block;padding:8px 12px;border:1px solid #E5DEC9;border-radius:999px;background:#FAF7F2;color:#8A6B1E;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase">Account Security</div>
      <h1 style="margin:20px 0 10px;color:#141413;font-size:26px;line-height:1.3">Reset your password</h1>
      <p style="margin:0;color:#6E675F;font-size:14px;line-height:1.8">We received a request to reset your Rent Nest password. Use the button below to choose a new password.</p>
      <p style="margin:28px 0;text-align:center"><a href="${escapeHtml(resetLink)}" style="display:inline-block;padding:14px 26px;border-radius:12px;background:#D4AF37;color:#141413;font-size:14px;font-weight:bold;text-decoration:none">Reset Password</a></p>
      <p style="margin:0;color:#81796D;font-size:12px;line-height:1.7">This link expires in <strong style="color:#141413">15 minutes</strong>. If you did not request a reset, you can ignore this email.</p>
    `;
    return shell("Reset your Rent Nest password. This link expires in 15 minutes.", content);
  }

  if (title) {
    const rows = details
      ? Object.entries(details).map(([key, value]) => `<tr><td style="padding:11px 8px;border-bottom:1px solid #EEE9DD;color:#6E675F;font-size:13px">${escapeHtml(key)}</td><td align="right" style="padding:11px 8px;border-bottom:1px solid #EEE9DD;color:#141413;font-size:13px;font-weight:bold">${escapeHtml(value)}</td></tr>`).join("")
      : "";
    const content = `
      <div style="display:inline-block;padding:8px 12px;border:1px solid #E5DEC9;border-radius:999px;background:#FAF7F2;color:#8A6B1E;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase">Rent Nest Update</div>
      <h1 style="margin:20px 0 10px;color:#141413;font-size:24px;line-height:1.3">${escapeHtml(title)}</h1>
      <p style="margin:0;color:#6E675F;font-size:14px;line-height:1.8">${escapeHtml(message)}</p>
      ${rows ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:22px;border-collapse:collapse">${rows}</table>` : ""}
    `;
    return shell(title, content);
  }

  const safeOtp = escapeHtml(otp);
  const content = `
    <div style="display:inline-block;padding:8px 12px;border:1px solid #E5DEC9;border-radius:999px;background:#FAF7F2;color:#8A6B1E;font-size:10px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase">Email Verification</div>
    <h1 style="margin:20px 0 10px;color:#141413;font-size:26px;line-height:1.3">Your verification code</h1>
    <p style="margin:0;color:#6E675F;font-size:14px;line-height:1.8">Enter this one-time code to verify your email and continue creating your Rent Nest account.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 22px"><tr><td style="padding:5px;border-radius:16px;background:#F4E9C6"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;background:#FFFCF4"><tr><td align="center" style="padding:19px 25px 21px;color:#8A6B1E;font-size:36px;line-height:1;font-weight:bold;letter-spacing:11px;font-family:Arial,Helvetica,sans-serif">${safeOtp}</td></tr></table></td></tr></table>
    <p style="margin:0;color:#6E675F;text-align:center;font-size:13px;line-height:1.7">This code expires in <strong style="color:#141413">5 minutes</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:26px"><tr><td style="border-top:1px solid #EEE9DD;font-size:1px;line-height:1px">&nbsp;</td></tr></table>
    <p style="margin:18px 0 0;color:#81796D;font-size:12px;line-height:1.7">If you did not request this code, you can ignore this email. For your security, never share your code with anyone.</p>
  `;
  return shell(`Your Rent Nest verification code is ${safeOtp}. It expires in 5 minutes.`, content);
};

module.exports = { emailTemp };