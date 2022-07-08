export class EnvironmentError extends Error {
    constructor(message?: string) {
        super(`EnvironmentError: ${message ?? 'An unknown error occurred.'}`)
        this.name = 'EnvironmentError'
    }
}
