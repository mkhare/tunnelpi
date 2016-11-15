var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;

var userSchema = schema({
   username : String,
   email : String,
   password : String
});

userSchema.methods.generateHash = function(password) {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(pass) {
   return bcrypt.compareSync(pass, this.password);
};


module.exports = mongoose.model('User', userSchema);