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

module.exports = { 
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}