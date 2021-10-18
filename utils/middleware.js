const logger = require('./logger')

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        request.token = authorization.substring(7)
    }
    next()
}

const errorHandler = (error, request, response, next) => {
    logger.error(error)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({
            error: 'malformatted id'
        })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({
            error: error.message
        })
    } else if (error.name === 'MongoServerError') {
        return response.status(400).send({
            error: error.message
        })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    } else if (error.name === 'JsonExpiredError') {
        return response.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(400).send({
        error: 'unknown endpoint'
    })
}

module.exports = {
    errorHandler, 
    requestLogger, 
    unknownEndpoint,
    tokenExtractor
}