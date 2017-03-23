var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/test');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var BlogPost = new Schema({
  author    : ObjectId,
  title     : String,
  body      : String,
  date      : Date
});

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Please Register or Login!!!');
});

app.post('/', multipartMiddleware, function(req, resp, next) {
  console.log(req.body, req.files);
  var pathTemp = req.files.image.path;
  var newFolder = process.cwd() + '/uploads/' + req.body.name + '-' + req.files.image.name;
  
  fs.rename(pathTemp, newFolder, function (err) {
    if (err) throw err;
    console.log('Uploaded');
  });

  next();
});

app.listen(3000, function () {
  console.log('Listening on Port 3000');
});