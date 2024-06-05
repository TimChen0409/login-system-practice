const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  // logOut method is provided by passport
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 8) {
    req.flash(
      "error_msg",
      "The password is too short, must be at least 8 characters for import"
    );
    return res.redirect("/auth/signup");
  }

  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash("error_msg", "The mailbox has been registered.");
    return res.redirect("/auth/signup");
  }

  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "You have successfully registered!");
  return res.redirect("/auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "The email address or password is incorrect", //connect to -> res.locals.error = req.flash("error");
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("enter redirect area");
  return res.redirect("/profile");
});

module.exports = router;
