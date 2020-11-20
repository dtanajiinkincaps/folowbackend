var mongoose = require('mongoose');
var post_like = new mongoose.Schema({
  post_id : String,
  email : String,
  username : String,
  like: String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_like', post_like)