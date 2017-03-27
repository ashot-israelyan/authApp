var express = require('express'),
  router = express.Router(),
  passport = require('passport'),
  multipart = require('connect-multiparty'),
  multipartMiddleware = multipart();

var User = require('../models/user');
var userContoller = require('../controllers/user-controller');

// Passport Controller
var passportController = require('../controllers/passport-controller').passport;

// Get Register Page
router.get('/register', function (req, res) {
  res.render('register');
});

//Get Login Page
router.get('/login', function (req, res) {
  res.render('login');
});

//Register User
router.post('/register', multipartMiddleware, userContoller.registerUser);

// Login User
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/');
  }
);

// Login with Facebook
router.get('/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/users/login'}),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

//Logout
router.get('/logout', function (req, res) {
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});

module.exports = router;