const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const emailTemp = ({ otp, resetLink, title, message, details }) => {
  if (resetLink) {
    return `
      <div style="background:#0f172a;padding:40px;font-family:Arial,sans-serif">
        <div style="max-width:550px;margin:auto;background:#fff;border-radius:20px;padding:40px;text-align:center">

          <h1 style="color:#4f46e5">
            Rent_Nest team 
          </h1>

          <h2>Password Reset Request</h2>

          <p>
            Click the button below to reset your password.
          </p>

          <a
            href="${escapeHtml(resetLink)}"
            style="
              display:inline-block;
              padding:15px 30px;
              background:#4f46e5;
              color:#fff;
              text-decoration:none;
              border-radius:10px;
              margin-top:20px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:25px;color:#64748b">
            This link will expire in
            <b>15 minutes</b>.
          </p>

        </div>
      </div>
    `;
  }

  if (title) {
    return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#0f172a"><h1 style="color:#4f46e5">Rent Nest</h1><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p>${details ? `<table style="width:100%;border-collapse:collapse">${Object.entries(details).map(([key, value]) => `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(key)}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">${escapeHtml(value)}</td></tr>`).join("")}</table>` : ""}</div>`;
  }

  const safeOtp = escapeHtml(otp);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title>Your Rent Nest verification code</title>
      </head>
      <body style="margin:0;padding:0;background-color:#edf3f3;font-family:Arial,Helvetica,sans-serif;color:#17343a">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">
          Your Rent Nest verification code is ${safeOtp}. It expires in 5 minutes.
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#edf3f3">
          <tr>
            <td align="center" style="padding:38px 14px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px">
                <tr>
                  <td style="padding:0 12px 12px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#123b3b;border-radius:22px 22px 0 0;box-shadow:0 10px 22px rgba(12,49,49,.18)">
                      <tr>
                        <td style="padding:27px 30px 25px">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td valign="middle" style="width:42px;height:42px;border-radius:13px;background-color:#d7f6df;color:#155e46;text-align:center;font-size:22px;font-weight:bold;box-shadow:0 4px 0 #a4d9b4">R</td>
                              <td valign="middle" style="padding-left:12px;color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.2px">Rent Nest<span style="display:block;padding-top:4px;color:#b8d8d0;font-size:11px;font-weight:normal;letter-spacing:2px;text-transform:uppercase">A place to feel at home</span></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 12px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;border:1px solid #dce9e6;border-radius:22px;box-shadow:0 16px 0 #dce8e5,0 24px 38px rgba(20,63,60,.16)">
                      <tr>
                        <td align="center" style="padding:38px 34px 34px">
                          <div style="display:inline-block;padding:9px 14px;border:1px solid #ccebdd;border-radius:999px;background-color:#effaf4;color:#247451;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">Secure sign-in</div>
                          <h1 style="margin:20px 0 10px;color:#143b3b;font-size:27px;line-height:1.25">Your verification code</h1>
                          <p style="margin:0;color:#607775;font-size:15px;line-height:1.7">Enter this one-time code to verify your email and continue to your Rent Nest account.</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:27px auto 20px">
                            <tr>
                              <td style="padding:5px;border-radius:17px;background-color:#dcefe5;box-shadow:0 7px 0 #b9d9c7,0 12px 20px rgba(31,91,64,.13)">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-radius:13px;background-color:#f2fbf5">
                                  <tr>
                                    <td align="center" style="padding:18px 27px 20px;color:#155e46;font-size:38px;line-height:1;font-weight:bold;letter-spacing:12px;font-family:Arial,Helvetica,sans-serif">${safeOtp}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:0;color:#607775;font-size:13px;line-height:1.6">This code expires in <strong style="color:#173f3b">5 minutes</strong>.</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px">
                            <tr><td style="border-top:1px solid #e7efec;font-size:1px;line-height:1px">&nbsp;</td></tr>
                          </table>
                          <p style="margin:20px 0 0;color:#879895;font-size:12px;line-height:1.7">If you didn’t request this code, you can safely ignore this email. For your security, never share your code with anyone.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:27px 20px 0;color:#82938f;font-size:11px;line-height:1.6">© Rent Nest · Your home, thoughtfully managed</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

module.exports = {
  emailTemp,
};
