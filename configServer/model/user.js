var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;

var userSchema = new schema({
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


module.exports = mongoose.model('User', userSchema, 'users');

// var mongoose = require('mongoose'),
// Schema = mongoose.Schema,
//     bcrypt = require('bcrypt-nodejs'),
// SALT_WORK_FACTOR = 10;
//
// var UserSchema = new Schema({
//    username: { type: String, required: true, index: { unique: true } },
//    password: { type: String, required: true }
// });
//
// UserSchema.pre('save, function(next) {
//    var user = this;
//
//    if (!user.isModified('password')) return next();
//
//    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//       if (err) return next(err);
//
//       // hash the password using our new salt
//       bcrypt.hash(user.password, salt, function(err, hash) {
//          if (err) return next(err);
//
//          // override the cleartext password with the hashed one
//          user.password = hash;
//          next();
//       });
//    });
//
//
// });
//
// UserSchema.methods.comparePassword = function(candidatePassword, cb) {
//    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//       if (err) return cb(err);
//       cb(null, isMatch);
//    });
// };
//
// module.exports = mongoose.model('User', UserSchema, 'users');