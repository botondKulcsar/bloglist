const Blog = require('../models/blog')
const User = require('../models/user')

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

const initialBlogs = [
    {
        title: 'First Blog',
        author: 'First Author',
        url: 'http://www.exampleblog.com',
        likes: 3
    },
    {
        title: 'Second Blog',
        author: 'Senior Author',
        url: 'http://www.superblog.com',
        likes: 9
    }
]

const initialUsers = [
    {
        username: 'test',
        name: 'test user',
        password: 'test'
    },
    {
        username: 'Test',
        name: 'Test Tser',
        password: 'test'
    }
]

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'Will Be Removed',
        url: 'http://www.willbedeleted.com'
    })
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs,
    initialUsers,
    nonExistingId,
    blogsInDb,
    usersInDb
}