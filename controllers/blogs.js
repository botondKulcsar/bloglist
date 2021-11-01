const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const userExtractor = require('../utils/middleware').userExtractor

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
        const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
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

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
    
    const user = request.user
    try {
        const blog = await Blog.findById(request.params.id)

        if (!blog) {
            return response.status(404).send({
                error: `no blog with id=${request.params.id} has been found`
            })
        }

        if (blog.user.toString() !== user._id.toString()) {
            return response.status(401).send({
                error: `not yours`
            })
        }

        await Blog.findByIdAndRemove(request.params.id)

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
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, payload, { new: true }).populate('user', { username: 1, name: 1 })
        const updatedAndFormattedBlog = updatedBlog.toJSON()
        response.status(200).json(updatedAndFormattedBlog)
    } catch (error) {
        next(error)
    }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
    const body = request.body
    const user = request.user

    try {

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        })

        let savedBlog = await blog.save()
        savedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
        
        user.blogs = [...user.blogs, savedBlog._id]
        await user.save()
        const savedAndFormattedBlog = await savedBlog.toJSON()
        response.status(201)
        response.json(savedAndFormattedBlog)
    } catch (error) {
        next(error)
    }
})


module.exports = blogsRouter