/**
 * Custom error classes
 * 
 * Any class defined here gets auto populated as a possible error on the error handler
 */

class BadRequest extends Error {
    constructor(message) {
        super(message)
        this.name = 'Bad Request'
        this.statusCode = 400
    }
}

class Unauthorized extends Error {
    constructor(message) {
        super(message)
        this.name = 'Unauthorized'
        this.statusCode = 401
    }
}

class NotFound extends Error {
    constructor(message) {
        super(message)
        this.name = 'Not Found'
        this.statusCode = 404
    }
}

class ServerError extends Error {
    constructor(message) {
        super(message)
        this.name = 'Server Error'
        this.statusCode = 500
    }
}

/**
 * Error handler function
 * 
 * Handles custom errors, sends generic 500 if not custom error
 */

const errorHandler = (err, req, res, next) => {
    const customErrors = Object.values(require('./error'))
        .filter(errorClass => errorClass.prototype instanceof Error && errorClass !== Error)

    const isCustomError = !!customErrors.find(errorClass => err instanceof errorClass)
    if (isCustomError) {

        res.status(err.statusCode).json({ error: err.message });
    } else {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    BadRequest,
    ServerError,
    Unauthorized,
    NotFound,
    errorHandler
}