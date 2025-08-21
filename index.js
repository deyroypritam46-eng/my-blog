const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ---------------------
// POSTS HANDLING
// ---------------------

const POSTS_FILE = "posts.json";

// Fetch all posts
app.get("/posts", (req, res) => {
  if (fs.existsSync(POSTS_FILE)) {
    const posts = JSON.parse(fs.readFileSync(POSTS_FILE));
    res.json(posts);
  } else {
    res.json([]);
  }
});

// Save new post
app.post("/publish", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content)
    return res.json({ success: false, msg: "Missing title or content" });

  let posts = [];
  if (fs.existsSync(POSTS_FILE)) {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE));
  }

  const newPost = {
    id: Date.now(),
    title,
    content,
    date: new Date().toISOString(),
  };

  posts.unshift(newPost); // add newest first
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));

  res.json({ success: true, post: newPost });
});

// ---------------------
// CONTACT FORM HANDLING
// ---------------------

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.json({ success: false, msg: "Missing fields" });
  }

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || "deyroypritam46@gmail.com",
        pass: process.env.GMAIL_PASS || "YOUR_GMAIL_APP_PASSWORD",
      },
    });

    let mailOptions = {
      from: email,
      to: "deyroypritam46@gmail.com",
      subject: `Contact Form Message from ${name}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// ---------------------
// START SERVER
// ---------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
