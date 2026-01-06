const SORTS = new Set(['newest', 'price_asc', 'price_desc', 'rating_desc']);

export function validateProductsQuery(req, res, next) {
  const q = (req.query.q || '').trim();
  const category = (req.query.category || '').trim().toLowerCase();
  const sort = (req.query.sort || 'newest').trim().toLowerCase();
  const page = Number.parseInt(req.query.page ?? '1', 10);
  const limit = Number.parseInt(req.query.limit ?? '24', 10);

  const priceMinRaw = req.query.price_min;
  const priceMaxRaw = req.query.price_max;

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ error: { code: 400, message: 'Invalid "page" (must be integer >= 1)' } });
  }
  if (!Number.isFinite(limit) || limit < 1 || limit > 60) {
    return res.status(400).json({ error: { code: 400, message: 'Invalid "limit" (1..60)' } });
  }

  
  if (!SORTS.has(sort)) {
    return res.status(400).json({ error: { code: 400, message: 'Invalid "sort" (newest|price_asc|price_desc|rating_desc)' } });
  }

  const price_min = priceMinRaw !== undefined ? Number(priceMinRaw) : undefined;
  const price_max = priceMaxRaw !== undefined ? Number(priceMaxRaw) : undefined;

  if (price_min !== undefined && (!Number.isFinite(price_min) || price_min < 0)) {
    return res.status(400).json({ error: { code: 400, message: 'Invalid "price_min" (>= 0)' } });
  }
  if (price_max !== undefined && (!Number.isFinite(price_max) || price_max < 0)) {
    return res.status(400).json({ error: { code: 400, message: 'Invalid "price_max" (>= 0)' } });
  }
  if (price_min !== undefined && price_max !== undefined && price_min > price_max) {
    return res.status(400).json({ error: { code: 400, message: '"price_min" must be <= "price_max"' } });
  }

  req.filters = { q, category };
  req.pagination = { page, limit };
  req.sort = sort;
  req.price = { min: price_min, max: price_max };

  next();
}
