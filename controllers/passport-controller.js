var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
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

passport.use(new FacebookStrategy({
    clientID: '1894625967418361',
    clientSecret: 'e2369ade8b710ac9d118bca769a064de',
    callbackURL: "http://localhost:3000/users/facebook/callback",
    profileFields: ['id', 'first_name', 'last_name', 'photos', 'email']
  },
  function (accessToken, refreshToken, profile, done) {

    var firstName = profile._json.first_name,
      lastName = profile._json.last_name,
      email = profile._json.email,
      image = profile._json.picture.data.url;


    User.getUserByEmail(email, function (err, user) {

      if (err) {
        console.log(err);
        done(err);
      }

      if (!user) {
        var newUser = new User({
          name: firstName,
          surname: lastName,
          username: firstName.toLowerCase() + '.' + lastName.toLowerCase(),
          email: email,
          image: image
        });

        User.createUser(newUser, function (err, user) {
          if (err) throw err;
          console.log(user);
        });
      }
      done(null, user);
    });
  }
));

// Expose Strategy.
exports = module.exports = passport;

// Exports.
exports.passport = passport;
