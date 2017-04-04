var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
  name: String,
  surname: String,
  username: {type: String, lowercase: true, unique: true},
  password: String,
  email: {type: String, require: true, unique: true},
  image: String,
  imageName: String,
  facebookId: {
    type: Boolean,
    default: 0
  }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
  if (newUser.password) {
    newUser.password = bcrypt.hashSync(newUser.password, 10);
  }
  newUser.save(callback);
};

module.exports.getUserByUsername = function(username, callback){
  var query = {username: username};
  User.findOne(query, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
};

module.exports.getUserByEmail = function (email, callback) {
  var query = {email: email};
  User.findOne(query, callback);
};

module.exports.getUserById = function(id, callback){
  User.findById(id, callback);
};

module.exports.getUserByFacebookID = function (FBID, callback) {
  var query = {facebookId: FBID};
  User.findOne(query, callback);
};