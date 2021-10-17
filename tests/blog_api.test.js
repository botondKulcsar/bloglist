const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('blog API', () => {
    test('returns the correct amount of blog posts in JSON format', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test(`returns the blog list with the unique identifier 'id' instead of the default '_id'`, async () => {
        const response = await api
            .get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })

    test('POST request creates a new blog post', async () => {
        await api
            .post('/api/blogs')
            .send({
                title: 'New Title',
                url: 'http://www.exampleTestblog.com'
            })
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const response = await api
            .get('/api/blogs')

        expect(response.body.length).toBe(helper.initialBlogs.length + 1)
        expect(response.body.map(blog => blog.title)).toContain('New Title')
    })
})

afterAll(() => {
    mongoose.connection.close()
})