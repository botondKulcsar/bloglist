const express = require('express')
const app = express()
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogRouter = require('./controllers/blogs')
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

app.use('/api/blogs', blogRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app