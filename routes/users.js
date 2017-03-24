var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var User = require('../models/user');

//Register
router.get('/register', function (req, res) {
  res.render('register');
});

//Login
router.get('/login', function (req, res) {
  res.render('login');
});

//Register User
router.post('/register', multipartMiddleware, function (req, res) {
  var name = req.body.name;
  var surname = req.body.surname;
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var imagename = req.body.imagename;

  //Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('surname', 'Surname is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    res.send('register', {
      errors: errors
    });
  } else {
    var pathTemp = req.files.image.path;
    var currentDest = process.cwd() + '/public';
    var newPath = '/uploads/' + req.body.username + '-' + req.files.image.name;

    fs.rename(pathTemp, currentDest + newPath, function (err) {
      if (err) throw err;
      console.log('Image Uploaded');
    });

    var newUser = new User({
      name: name,
      surname: surname,
      username: username,
      password: password,
      email: email,
      image: newPath,
      imagename: imagename
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, {message: 'Unknown User'});
      }

      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      });
    });
  }));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}),
  function (req, res) {
    res.redirect('/');
  });

router.get('/logout', function (req, res) {
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});

module.exports = router;