type LoggerFn = (type: 'bot' | 'db' | 'server', ...args: any[]) => void

interface Logger {
    info: LoggerFn
    warn: LoggerFn
    error: LoggerFn
}

const logger: Logger = {
    info: (type, ...args) => console.info(`[${type}]`, ...args),
    warn: (type, ...args) => console.warn(`[${type}] warn:`, ...args),
    error: (type, ...args) => console.error(`[${type}] error:`, ...args)
}

export default logger
