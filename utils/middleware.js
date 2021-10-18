const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        return authorization.substring(7)
    }
    return null
}

const userExtractor = async (request, response, next) => {
    const token = tokenExtractor(request)
    if (!token) {
        return response.status(401).send({ error: 'token missing' })
    }
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET)
        if (!decodedToken.id) {
            return response.status(401).send({ error: 'token invalid' })
        }
        const user = await User.findById(decodedToken.id)
        request.user = user
    
        next()
    } catch (error) {
        next(error)
    }

}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

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
    } else if (error.name === 'JsonExpiredError' || error.name === 'TokenExpiredError') {
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
    userExtractor
}