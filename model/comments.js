let mongoose = require("mongoose");

let commentSchema = mongoose.Schema({
    name: String,
    email: String,
    comment: String,
    blogId:String,
    date: {
        type: Date,
        default: Date.now,
    },
});

let Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
