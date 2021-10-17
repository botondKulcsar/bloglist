const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        unique: true,
    },
    author: {
        type: String,
        // required: true,
        // minlength: 3
    },
    url: {
        type: String,
        required: true,
        minlength: 10,
        unique: true,
    },
    likes: {
        type: Number,
        default: 0
    }
  })

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

blogSchema.plugin(uniqueValidator)
  
module.exports = mongoose.model('Blog', blogSchema)