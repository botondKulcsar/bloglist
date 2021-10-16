const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
        ? 0
        : blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null

    let favorite = blogs[0]

    for (const blog of blogs) {
        if (blog.likes > favorite.likes) {
            favorite = blog
        }
    }

    return favorite
}

const mostBlogs = blogs => {
    if (blogs.length === 0) return null
    if (blogs.length === 1) {
        return {
            author: blogs[0].author,
            blogs: 1
        }
    }
    const authors = {}
    let result = {}

    for (const blog of blogs) {
        authors[blog.author] = authors[blog.author] ? authors[blog.author] + 1 : 1
    }

    authors

    let maxBlogs = authors[blogs[0].author]
    
    for (const author in authors) {
        if (authors[author] > maxBlogs) {
            maxBlogs = authors[author]
            result = { author, blogs: authors[author]}
        }
    }
    
    return result
}

const mostLikes = blogs => {
    if (blogs.length === 0) return null
    if (blogs.length === 1) {
        return {
            author: blogs[0].author,
            likes: blogs[0].likes
        }
    }
    const authors = {}
    let result = {}

    for (const blog of blogs) {
        if (blog.author in authors) {
            authors[blog.author] += blog.likes
        } else {
            authors[blog.author] = blog.likes
        }
    }

    let maxBlogs = authors[blogs[0].author]
    
    for (const author in authors) {
        if (authors[author] > maxBlogs) {
            maxBlogs = authors[author]
            result = { author, likes: authors[author]}
        }
    }
    
    return result
}

module.exports = { 
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}