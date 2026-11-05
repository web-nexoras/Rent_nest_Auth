const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const isValidMonth = (value) => MONTH_REGEX.test(value);

module.exports = {
  MONTH_REGEX,
  getCurrentMonth,
  isValidMonth,
};
