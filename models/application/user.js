var mongoose = require('mongoose');
var user = new mongoose.Schema({
    // fname : String,
    // lname : String,
    username : String,
    email : String,
    mobile: String,
    name : String,
    gender : String,
    about_me : String,
    profile_image : String,
    background_image : String,
    password : String,
    confirm_pass : String,
    random : String,
    is_email_verified : Boolean,
    is_mobile_verified : Boolean,
    register_otp : String,
    register_otp_session : String,
    reset_password_otp : String,
    reset_password_otp_session : String,
    create_at : String,
    auth_token : String
  })
  module.exports = mongoose.model('user', user)