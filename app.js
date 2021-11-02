const express = require('express')
const path = require('path')
const app = express()
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const staticUrl = path.join(__dirname, './build')

const mongoose = require('mongoose')


mongoose.connect(config.MONGODB_URI)
    .then(() => logger.info(`connected to MongoDB`))
    .catch(err => {
        logger.error(`failed to connect to MongoDB. Exiting...`)
        process.exit(1)
    })



app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter)

if (process.env.NODE_ENV === 'test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing', testingRouter)
}

app.get('*/*', express.static(staticUrl))

app.all('*', (request, response) => {
    response.status(200).sendFile(`${staticUrl}/index.html`)
})
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app