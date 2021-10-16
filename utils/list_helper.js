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

module.exports = { 
    dummy,
    totalLikes,
    favoriteBlog
}