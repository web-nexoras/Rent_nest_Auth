const parseNumber = (
  value,
  label,
  { required = false, min = 0, max = Infinity, integer = false } = {},
) => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      return { error: `${label} is required` };
    }
    return { value: undefined };
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < min) {
    return { error: `${label} must be a number of at least ${min}` };
  }

  if (number > max) {
    return { error: `${label} must not exceed ${max}` };
  }

  if (integer && !Number.isInteger(number)) {
    return { error: `${label} must be a whole number` };
  }

  return { value: number };
};

module.exports = { parseNumber };
