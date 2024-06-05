const router = require("express").Router();
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
  //passport.serializeUser set req.isAuthenticated() to true
  if (req.isAuthenticated()) {
    next();
  } else {
    //If you have not verified, you will be redirected to the login page.
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, async (req, res) => {
  console.log("enter /profile");
  let postFound = await Post.find({ author: req.user._id });
  return res.render("profile", { user: req.user, posts: postFound }); // deSerializeUser()
});

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "title and content are required");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
