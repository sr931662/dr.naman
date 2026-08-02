/** Uniform success envelope so the admin UI and the site can rely on one shape. */
export function ok(res, data, meta) {
  const body = { success: true, data }
  if (meta) body.meta = meta
  return res.json(body)
}

export function created(res, data) {
  return res.status(201).json({ success: true, data })
}

export function noContent(res) {
  return res.status(204).end()
}

/** Normalises `?page=&limit=` into skip/limit plus a meta builder. */
export function paginate(query, { defaultLimit = 25, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit))
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    meta: total => ({
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    }),
  }
}
