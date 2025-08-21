const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Ensure uploads folder exists
if (!fs.existsSync("public/uploads")) fs.mkdirSync("public/uploads");

// Routes
app.get("/posts", (req, res) => {
  const posts = JSON.parse(fs.readFileSync("posts.json"));
  res.json(posts);
});

app.post("/posts", upload.single("image"), (req, res) => {
  const posts = JSON.parse(fs.readFileSync("posts.json"));
  const newPost = {
    id: Date.now(),
    title: req.body.title,
    content: req.body.content,
    category: req.body.category || "General",
    tags: req.body.tags ? req.body.tags.split(",") : [],
    image: req.file ? `/uploads/${req.file.filename}` : null,
  };
  posts.unshift(newPost);
  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
  res.json({ success: true, post: newPost });
});

app.put("/posts/:id", (req, res) => {
  let posts = JSON.parse(fs.readFileSync("posts.json"));
  const id = parseInt(req.params.id);
  posts = posts.map((post) =>
    post.id === id ? { ...post, ...req.body } : post
  );
  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
  res.json({ success: true });
});

app.delete("/posts/:id", (req, res) => {
  let posts = JSON.parse(fs.readFileSync("posts.json"));
  const id = parseInt(req.params.id);
  posts = posts.filter((post) => post.id !== id);
  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
