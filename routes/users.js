var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var validator = require('validator');
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var index = require('./index');

var User = require('../models/user');

router.get('/register', function (req, res, next) {

  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  } else {
    res.render('register');
    next();
  }
});

router.get('/login', function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  } else {
    res.render('login');
    next();
  }
});

router.post('/register', multipartMiddleware, function (req, res) {

    var name = req.body.name,
      surname = req.body.surname,
      username = req.body.username,
      password = req.body.password,
      email = req.body.email,
      imageName = req.body.imageName;

    if (name !== '') {
      if (!validator.isAlpha(name)) {
        return res.json({success: false, message: 'The name must contain only letters'});
      }
    }

    if (surname && surname !== '') {
      if (!validator.isAlpha(surname) || !validator.isAlpha(surname)) {
        return res.json({success: false, message: 'The surname must contain only letters'});
      }
    }

    if (!validator.isEmpty(username)) {
      if (!validator.isAlphanumeric(username) && validator.isLowercase(username)) {
        return res.json({success: false, message: "The username must be lowercase and contain only letters and numbers"});
      }
    } else {
      return res.json({success: false, message: "Please specify a username, it's required!"});
    }


    if (!validator.isEmpty(email)) {
      if (!validator.isEmail(email)) {
        return res.json({success: false, message: 'Please provide a valid email'});
      }
    } else {
      return res.json({success: false, message: "Please specify an email, it's required!"});
    }

    if (!validator.isEmpty(password)) {
      if (!validatePassword(password)) {
        return res.json({
          success: false,
          message: 'The password must contain at least one number, one lowercase and one uppercase letter'
        });
      }
    } else {
      return res.json({success: false, message: "The password field can't be empty. Please provide a password!"});
    }

    if (imageName && imageName !== '') {
      if (!validator.isAlphanumeric(imageName)) {
        return res.json({
          success: false,
          message: "The image name can only contain letters and numbers, please provide a valid one"
        });
      }
    }

    var newPath = '';

    if (req.files && req.files !== '') {
      var pathTemp = req.files.image.path;
      var currentDest = process.cwd() + '/public';

      if (imageName === '') {
        imageName = username + '-' + req.files.image.name;
      } else {
        imageName = imageName + '-' + req.files.image.name;
      }

      newPath = '/uploads/' + imageName;

      if (!fs.existsSync(currentDest + '/uploads')) {
        fs.mkdirSync(currentDest + '/uploads');
      }

      fs.rename(pathTemp, currentDest + newPath, function (err) {
        if (err) throw err;
        console.log("File Saved!!!");
      });
    }

    var newUser = new User({
      name: name,
      surname: surname,
      username: username,
      password: password,
      email: email,
      image: newPath,
      imageName: imageName
    });

    User.createUser(newUser, function (err, user) {
      if (err) {
        if (err.code === 11000) {
          if (err.errmsg[60] === 'u') {
            return res.json({success: false, message: "The username is already taken"});
          } else if (err.errmsg[60] === "e") {
            res.json({success: false, message: "The e-mail is already taken"});
          }
        } else {
          res.json({success: false, message: err});
        }
      }
      res.json({success: true, message: "You were successfully registered"});
    });
  }
);

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

passport.use(new FacebookStrategy({
    clientID: '1894625967418361',
    clientSecret: 'e2369ade8b710ac9d118bca769a064de',
    callbackURL: 'http://localhost:3000/users/facebook/callback',
    profileFields: ['id', 'first_name', 'last_name', 'photos', 'email']
  },
  function (accessToken, refreshToken, profile, done) {
    User.getUserByFacebookID(profile._json.id, function (err, user) {
      if (err) done(err);
      if (user && user !== null) {
        done(null, user);
      } else {
        User.getUserByEmail(profile._json.email, function (err, user) {
          if (err) done(err);

          if (user && user !== null) {
            if (user.facebookId === 0) {
              user.facebookId = profile._json.id;

              User.update(user, function (err, newUser) {
                if (err) throw err;
                console.log('User updated ' + newUser);
              });
            }

            done(null, user);
          } else {

            var newUser = new User({
              name: profile._json.first_name,
              surname: profile._json.last_name,
              email: profile._json.email,
              image: profile._json.picture.data.url
            });

            User.createUser(newUser, function (err, user) {
              if (err) throw err;

              done(null, user);
            });
          }
        });
      }
    });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/users/login'
  }),
  function (req, res) {
    res.redirect('/dashboard');
  }
);

router.get('/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/'}), function (req, res) {
  res.redirect('/dashboard');
});

router.get('/logout', function (req, res) {
  req.logout();

  res.redirect('/users/login');
});

module.exports = router;

function validatePassword(password) {
  var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  return re.test(password);
}