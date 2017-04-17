var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var morgan = require('morgan');
var MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://127.0.0.1:27017/authapi', function (err) {
  if (err) {
    console.log("Not connected to the database: " + err);
  } else {
    console.log("Successfully connected to the database");
  }
});
mongoose.Promise = global.Promise;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//  Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'supersecret',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', routes);
app.use('/users', users);

//Set Port
app.set('port', (process.env.PORT) || 3000);

app.listen(app.get('port'), function () {
  console.log('Server started on port ' + app.get('port'));
});
