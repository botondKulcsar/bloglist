const express = require('express')
const app = express()
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const cors = require('cors')

const mongoose = require('mongoose')


mongoose.connect(config.MONGODB_URI)
    .then(() => logger.info(`connected to MongoDB`))
    .catch(err => {
        logger.error(`failed to connect to MongoDB. Exiting...`)
        process.exit(1)
    })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app