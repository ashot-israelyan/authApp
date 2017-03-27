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

