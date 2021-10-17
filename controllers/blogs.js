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