const myExpress = require("express");

const microCors = require('micro-cors');
// const cors = require("cors");
const cors = microCors();

require("dotenv").config();

const app = myExpress();

app.use(myExpress.json());
app.use(cors());

app.use(myExpress.json());

const port = process.env.PORT || 3020;


app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

require("./model/db");

const bcrypt = require("bcrypt");

const SignupUsers = require("./model/user");

const Blog = require("./model/blog");

const Comment = require("./model/comments");

const token = require("jsonwebtoken");

app.post("/signup", async (req, res) => {
  
  try {
    const existingUser = await SignupUsers.findOne({ email: req.body.email });
    const existingUserName = await SignupUsers.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(400).send("User with this email already exists");
    }
    if (existingUserName) {
      return res.status(402).send("User with this userName already exists");
    }
    const newUser = new SignupUsers(req.body);

    await newUser.save();

    res.send("User Created");

  } catch (e) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  try {

    const user = await SignupUsers.findOne({ email: req.body.email, password:req.body.password });

    if (!user) {
      return res.status(404).send("Invalid Credentials");
    }
    if (user) {
      token.sign({tokenId: user._id }, "My user", { expiresIn: "1y" },async (err, myToken) => {
          res.json({ user, myToken });
        }
      );
    } else {
      res.status(404).send("Invalid Credentials");
    }
  } catch (e) {
    res.status(500).send("Internal Server Error");
  }
});

app.post("/session-check", async (req, res) => {
  try {
    token.verify(req.body.token, "My user", async function (err, dataObj) {
      if (dataObj) {
        const user = await SignupUsers.findById(dataObj.tokenId);
        res.json(user);
      }
    });
  } catch (e) { }
});

app.get("/Users", async (req, res) => {
  try {
    const newUser = await SignupUsers.find().sort({ _id: -1 });
    res.json(newUser);
  } catch (e) {
    console.log(e);
  }
});

app.delete("/deleteUser", async function (req, res) {
  try {
    await SignupUsers.findByIdAndDelete(req.query.id);
    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});

app.post("/blog", async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.send({ message: "Blog Added" });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/blog", async (req, res) => {
  try {
    const newBlog = await Blog.find().sort({ _id: -1 });
    res.json(newBlog);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/singleBlog", async (req, res) => {
  try {
    const singleBlog = await Blog.findById(req.query.id);
    res.json(singleBlog);
  } catch (e) {
    res.end(e);
  }
});

app.delete("/deleteBlog", async function (req, res) {
  try {
    await Blog.findByIdAndDelete(req.query.id);
    res.end("Delete ho gya");
  } catch (e) {
    res.send(e);
  }
});
app.get("/blog_edit", async function (req, res) {
  try {
    const blog = await Blog.findById(req.query.id);
    res.json(blog);
  } catch (e) {
    res.status(500).json(e);
  }
});

app.put("/blog_update", async function (req, res) {
  try {
    const blogId = req.body._id;

    const existingBlog = await Blog.findById(blogId);

    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    existingBlog.title = req.body.title;
    existingBlog.author = req.body.author;
    existingBlog.issueDate = req.body.issueDate;
    existingBlog.image = req.body.image;
    existingBlog.description = req.body.description;
    
    await existingBlog.save();
    res.json({ message: "Blog Updated" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/comments", async (req, res) => {
  try {
    
    let ob = { ...req.body };
    delete ob._id;
    const newComment = await Comment.create(ob);
    const allComments = await Comment.find();
    res.send({ message: "Feedback submitted", alldata: allComments });

  } catch (e) {
    console.log(e);
  }

});

app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find().sort({ _id: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/deleteComment", async function (req, res) {
  try {
    await Comment.findByIdAndDelete(req.query.id);
    let allItems = await Comment.find();
    res.send({
      message: "success",
      alldata: allItems,
    });
  } catch (e) {
    res.send(e);
  }
});


app.get("/dashboard", async function (req, res) {
  try {
    const Users = await SignupUsers.find();
    const Blogs = await Blog.find();
    const comments = await Comment.find();
    res.json({ Users, Blogs, comments });
  } catch (e) {
    res.send(e);
  }
});

