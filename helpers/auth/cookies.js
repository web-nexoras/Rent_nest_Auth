const isProd = process.env.NODE_ENV === "production";

const baseCookieConfig = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

const accessCookieConfig = {
  ...baseCookieConfig,
  maxAge: 15 * 60 * 1000,
};

const refreshCookieConfig = {
  ...baseCookieConfig,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = {
  baseCookieConfig,
  accessCookieConfig,
  refreshCookieConfig,
};
