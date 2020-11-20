var mongoose = require('mongoose');
var post_like_video = new mongoose.Schema({
  video: String,
  video_id : String,
  email : String,
  username : String,
  like: String,
  post_like : String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_like_video', post_like_video)