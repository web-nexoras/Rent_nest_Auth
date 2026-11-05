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
            href="${resetLink}"
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

  return `
    <div style="background:#0f172a;padding:40px;font-family:Arial,sans-serif">
      <div style="max-width:550px;margin:auto;background:white;border-radius:20px;padding:40px;text-align:center">

        <h1 style="color:#4f46e5">
Rent_Nest team 
        </h1>

        <h2>Your OTP</h2>

        <div
          style="
            font-size:40px;
            font-weight:bold;
            color:#4f46e5;
            letter-spacing:10px;
          "
        >
          ${otp}
        </div>

        <p>
          This code expires in <b>5 minutes</b>.
        </p>

      </div>
    </div>
  `;
};

module.exports = {
  emailTemp,
};
