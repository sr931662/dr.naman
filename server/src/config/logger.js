const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }
const active = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info

const stamp = () => new Date().toISOString()

function emit(level, stream, args) {
  if (LEVELS[level] > active) return
  stream(`[${stamp()}] ${level.toUpperCase()}`, ...args)
}

export const logger = {
  error: (...a) => emit('error', console.error, a),
  warn: (...a) => emit('warn', console.warn, a),
  info: (...a) => emit('info', console.log, a),
  debug: (...a) => emit('debug', console.log, a),
}
