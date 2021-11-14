const usersRouter = require('express').Router();
const User = require('../models/user')
const bcrypt = require('bcrypt');

usersRouter.post('/', async (request, response, next) => {
    const body = request.body
    try {
        if (body?.password.length < 3) {
            const error = new Error('password minlength is 3')
            error.name = 'ValidationError'
            throw error
        }
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)

        const user = new User({
            username: body.username,
            name: body.name,
            passwordHash
        })

        const savedUser = await user.save()
        response.status(201)
        response.json(savedUser)
    } catch (error) {
        next(error)
    }
})

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })

        response.json(users)
    } catch (error) {
        next(error)
    }
})

usersRouter.get('/:id', async (request, response, next) => {
    try {
        const user = await User.findById(request.params.id).populate('blogs', { title: 1, author: 1, url: 1 })
        if (!user) {
            return response.status(404).send({
                error: `no user with id=${request.params.id} has been found`
            })
        }
        response.status(200)
        response.json(user.toJSON())
    } catch (error) {
        next(error)
    }
})

module.exports = usersRouter