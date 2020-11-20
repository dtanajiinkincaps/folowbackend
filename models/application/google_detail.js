var mongoose = require('mongoose');
var google_detail = new mongoose.Schema({
    id : String,
    name : String,
    email : String,
    photoUrl : String,
    firstName : String,
    lastName : String,
    google_authToken : String,
    auth_token : String,
    idToken : String,
    provider : String
  })
  module.exports = mongoose.model('google_detail', google_detail)