const emailTemp = ({ otp, resetLink }) => {
  if (resetLink) {
    return `
      <div style="background:#0f172a;padding:40px;font-family:Arial,sans-serif">
        <div style="max-width:550px;margin:auto;background:#fff;border-radius:20px;padding:40px;text-align:center">

          <h1 style="color:#4f46e5">
            Damo Ecommerce
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
            <b>10 minutes</b>.
          </p>

        </div>
      </div>
    `;
  }

  return `
    <div style="background:#0f172a;padding:40px;font-family:Arial,sans-serif">
      <div style="max-width:550px;margin:auto;background:white;border-radius:20px;padding:40px;text-align:center">

        <h1 style="color:#4f46e5">
Student Management System
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
