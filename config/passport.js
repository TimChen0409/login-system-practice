const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  // user is foundUser or savedUser
  console.log("Serialize user...");
  done(null, user._id); // only save UserID in session
  // after signing the ID, it is given to the user in the form of a cookie.
});

// retrieve the original User data through UserID and store it in req.user
passport.deserializeUser(async (_id, done) => {
  console.log("Deserialize user...");
  const foundUser = await User.findOne({ _id });
  done(null, foundUser);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("enter Google Strategy area");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("The user has already registered.");
        done(null, foundUser);
      } else {
        console.log("create a new user and store to database");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let savedUser = await newUser.save();
        console.log("user created successfully.");
        done(null, savedUser);
      }
    }
  )
);

passport.use(
  // Must be consistent with the account and password field names on the login page
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    } else {
      done(null, false);
    }
  })
);
