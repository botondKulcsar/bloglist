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

    test('if the likes property is missing from the request it will default to 0', async () => {
        const response = await api
            .post('/api/blogs')
            .send({
                title: 'New Title',
                url: 'http://www.exampleTestblog.com'
            })
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(response.body.likes).toBe(0)
    })

    test('if the title or url property is missing from the request, api responds with status code 400', async () => {
        await api
            .post('/api/blogs')
            .send({
                url: 'http://www.exampleTestblog.com'
            })
            .expect(400)
    })
})

describe('delete', () => {
    test('works in case of a valid id', async () => {
        const response = await api
            .get('/api/blogs')

        const validId = response.body[0].id

        await api
            .delete(`/api/blogs/${validId}`)
            .expect(204)

        const result = await api
            .get('/api/blogs')

        expect(result.body.length).toBe(helper.initialBlogs.length - 1)

        const titles = result.body.map(blog => blog.title)
        expect(titles).not.toContain('First Blog')

    })

    test('returns status code 404 in case of inexistent id', async () => {
        
        const invalidId = await helper.nonExistingId()
        console.log(invalidId)
        await api
            .delete(`/api/blogs/${invalidId}`)
            .expect(404)

        const result = await api
            .get('/api/blogs')

        expect(result.body.length).toBe(helper.initialBlogs.length)

    })
})

afterAll(() => {
    mongoose.connection.close()
})