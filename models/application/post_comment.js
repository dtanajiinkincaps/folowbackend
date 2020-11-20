var mongoose = require('mongoose');
var post_comment = new mongoose.Schema({
  post_id : String,
  email : String,
  username : String,
  comment: String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_comment', post_comment)