var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post")
const localStrtegy = require("passport-local");
const passport = require("passport");
passport.use(new localStrtegy(userModel.authenticate()));
const upload =require("./multer")

router.get("/", function (req, res, next) {
  res.render("index", {error : req.flash('error')});
});

router.get("/register", function (req, res, next) {
  res.render("register");
});
router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = 
  await userModel
        .findOne({username: req.session.passport.user})
        .populate("post")
  res.render("profile", {user});
});
router.get("/add", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render("add", {user});
});
router.post("/createpost", isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })

  user.post.push(post._id);
  await user.save();
  res.redirect("/profile");
});
router.post("/fileupload", isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
});
router.post("/register", function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
  });

  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

//login
router.post("/login", passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true
  }),
  function (req, res, next) {}
);

//logout
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//IsLoggedIn
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}



module.exports = router;
