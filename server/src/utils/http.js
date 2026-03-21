export function sendError(res, status, code, message, extra = {}) {
  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...extra,
    },
  });
}

export function sendOk(res, data) {
  res.json({
    ok: true,
    ...data,
  });
}
