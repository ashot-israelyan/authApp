var fs = require('fs');

var User = require('../models/user');

module.exports.registerUser = function (req, res) {
  var name = req.body.name;
  var surname = req.body.surname;
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var imagename = req.body.imagename;

  //Validation
  req.checkBody({
    'name' : {
      isLength: {
        options: [{min: 2, max: 50}],
        errorMessage: 'Must be between 2 and 50 chars long'
      }
    },
    'surname' : {
      isLength: {
        options: [{min: 2, max: 50}],
        errorMessage: 'Must be between 2 and 50 chars long'
      }
    },
    'username' : {
      notEmpty: true,
      isLength: {
        options: [{min: 2, max: 10}],
        errorMessage: 'Must be between 2 and 10 chars long'
      }
    },
    'password': {
      notEmpty: true,
      errorMessage: 'Invalid Password' // Error message for the parameter
    },
    'email': {
      notEmpty: true,
      isEmail: {
        errorMessage: 'Invalid Email'
      }
    }
  });

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
      imagename: imagename,
      facebook_id: 0
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
  }
};