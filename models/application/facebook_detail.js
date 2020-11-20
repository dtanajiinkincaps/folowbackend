var mongoose = require('mongoose');
var facebook_detail = new mongoose.Schema({
    id : String,
    name : String,
    email : String,
    photoUrl : String,
    firstName : String,
    lastName : String,
    facebook_authToken : String,
    auth_token : String,
    provider : String
  })
  module.exports = mongoose.model('facebook_detail', facebook_detail)