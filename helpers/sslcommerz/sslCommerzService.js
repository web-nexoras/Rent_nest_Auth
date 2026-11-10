// SSLCommerz gateway session and payment validation helper
const getSslBaseUrl = () => {
  const isLive = String(process.env.SSL_IS_LIVE).toLowerCase() === "true";
  return isLive
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
};

const getStoreCredentials = () => ({
  store_id: (process.env.SSL_STORE_ID || "webne6aa18fd75c425").trim(),
  store_passwd: (process.env.SSL_STORE_PASSWORD || "webne6aa18fd75c425@ssl").trim(),
});

const initSslSession = async (payload) => {
  const baseUrl = getSslBaseUrl();
  const { store_id, store_passwd } = getStoreCredentials();

  const params = new URLSearchParams({
    store_id,
    store_passwd,
    ...Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [k, v == null ? "" : String(v)]),
    ),
  });

  const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  return response.json();
};

const validateSslPayment = async (valId) => {
  if (!valId) return null;
  const baseUrl = getSslBaseUrl();
  const { store_id, store_passwd } = getStoreCredentials();

  const query = new URLSearchParams({
    val_id: String(valId),
    store_id,
    store_passwd,
    format: "json",
  });

  try {
    const response = await fetch(
      `${baseUrl}/validator/api/validationserverAPI.php?${query.toString()}`,
    );
    return await response.json();
  } catch (error) {
    console.error("SSLCommerz validation error:", error.message);
    return null;
  }
};

module.exports = {
  getSslBaseUrl,
  getStoreCredentials,
  initSslSession,
  validateSslPayment,
};
