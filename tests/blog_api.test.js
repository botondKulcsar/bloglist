const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({
            username: 'root',
            passwordHash
        })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'jest',
            name: 'will be deleted',
            password: 'idontKnow'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'idontKnow'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('duplicate key')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode if password length is less than the minimum', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'i0'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('minlength')
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode if username length is less than the minimum', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: 'su',
            name: 'Superuser',
            password: 'i0asdf'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('is shorter than the minimum allowed length')
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
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
        const passwordHash = await bcrypt.hash(helper.initialUsers[0].password, 10)
        const newUser = new User({ ...helper.initialUsers[0], passwordHash })
        const savedUser = await newUser.save()

        await api
            .post('/api/blogs')
            .send({
                title: 'New Title',
                url: 'http://www.exampleTestblog.com',
                userId: savedUser._id.toString()
            })
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api
            .get('/api/blogs')

        expect(response.body.length).toBe(helper.initialBlogs.length + 1)
        expect(response.body.map(blog => blog.title)).toContain('New Title')
    })

    test('if the likes property is missing from the request it will default to 0', async () => {
        const passwordHash = await bcrypt.hash(helper.initialUsers[1].password, 10)
        const newUser = new User({ ...helper.initialUsers[1], passwordHash })
        const savedUser = await newUser.save()

        const response = await api
            .post('/api/blogs')
            .send({
                title: 'New Title',
                url: 'http://www.exampleTestblog.com',
                userId: savedUser._id.toString()
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

describe('delete a blog', () => {
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

        await api
            .delete(`/api/blogs/${invalidId}`)
            .expect(404)

        const result = await api
            .get('/api/blogs')

        expect(result.body.length).toBe(helper.initialBlogs.length)

    })
})

describe('update a blog', () => {
    test('works in case of valid id', async () => {
        const response = await api
            .get('/api/blogs')

        const validId = response.body[0].id

        const result = await api
            .patch(`/api/blogs/${validId}`)
            .send({
                likes: 99
            })
            .expect(200)

        expect(result.body.likes).toBe(99)
    })

    test('returns status code 404 in case of nonexisting id', async () => {
        const nonExistingId = await helper.nonExistingId()

        await api
            .patch(`/api/blogs/${nonExistingId}`)
            .send({
                likes: 99
            })
            .expect(404)
    })
})

afterAll(() => {
    mongoose.connection.close()
})