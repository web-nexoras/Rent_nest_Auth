const parsePagination = (query, { defaultLimit = 10, maxLimit = 50 } = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

module.exports = { parsePagination };
