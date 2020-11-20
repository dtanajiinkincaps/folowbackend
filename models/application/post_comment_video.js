var mongoose = require('mongoose');
var post_comment_video = new mongoose.Schema({
  video: String,
  video_id : String,
  email : String,
  username : String,
  comment: String,
  post_comment : String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_comment_video', post_comment_video)