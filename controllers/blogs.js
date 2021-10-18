const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
        const formattedBlogs = blogs.map(blog => blog.toJSON())
        response.json(formattedBlogs)
    } catch (error) {
        next(error)
    }
})

blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
        if (!blog) {
            return response.status(404).send({
                error: `no blog with id=${request.params.id} has been found`
            })
        }
        const formattedBlog = blog.toJSON()
        response.json(formattedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        const deletedBlog = await Blog.findByIdAndRemove(request.params.id)
        if (!deletedBlog) {
            return response.status(404).send({
                error: `no blog with id=${request.params.id} has been found`
            })
        }

        response.status(204).end()
    } catch (error) {
        next(error)
    }
})

blogsRouter.patch('/:id', async (request, response, next) => {
    try {
        const blogToUpdate = await Blog.findById(request.params.id)
        if (!blogToUpdate) {
            return response.status(404).send({
                error: `no blog with id=${request.params.id} has been found`
            })
        }

        const payload = request.body
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, payload, { new: true })
        response.status(200).json(updatedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
        return response.status(401).send({ error: 'token missing or invalid' })
    }

    try {
        const user = await User.findById(decodedToken.id)
        
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        })

        const savedBlog = await blog.save()
        user.blogs = [ ...user.blogs, savedBlog._id ]
        await user.save()

        response.status(201)
        response.json(savedBlog.toJSON())
    } catch (error) {
        next(error)
    }
})


module.exports = blogsRouter