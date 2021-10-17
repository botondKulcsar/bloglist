const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({})
        const formattedBlogs = blogs.map(blog => blog.toJSON())
        response.json(formattedBlogs)
    } catch (error) {
        next(error)
    }
})

blogRouter.get('/:id', async (request, response, next) => {
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

blogRouter.delete('/:id', async (request, response, next) => {
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

blogRouter.post('/', async (request, response, next) => {
    const blog = new Blog(request.body)

    try {
       const savedBlog = await blog.save()
       response.status(201)
       response.json(savedBlog.toJSON())
    } catch (error) {
        next(error)
    }
})


module.exports = blogRouter