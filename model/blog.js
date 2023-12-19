    let mongoose = require("mongoose");

    let blogSchema = mongoose.Schema({
        title:String,
        author:String,
        issueDate:Date,
        description:String,
        image:String,
        date: {
            type: Date,
            default: Date.now,
        },
    });

    let Blog = mongoose.model('blog', blogSchema);

    module.exports = Blog;
