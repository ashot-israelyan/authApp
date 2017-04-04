var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.render('dashboard', {
      message: 'If you see this page, that means that you are successfully logined'
    });
    next();
  } else {
    return res.redirect('/users/login');
  }
});

router.get('/dashboard', function (req, res, next) {

  if (req.isAuthenticated()) {
    res.render('dashboard', {
      message: 'If you see this page, that means that you are successfully logined'
    });
    next();
  } else {
    return res.redirect('/users/login');
  }
});

module.exports = router;