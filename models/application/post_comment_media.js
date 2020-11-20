var mongoose = require('mongoose');
var post_comment_media = new mongoose.Schema({
  media: String,
  media_id : String,
  email : String,
  username : String,
  comment: String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_comment_media', post_comment_media)