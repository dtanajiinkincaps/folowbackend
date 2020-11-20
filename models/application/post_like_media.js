var mongoose = require('mongoose');
var post_like_media = new mongoose.Schema({
  media: String,
  media_id : String,
  email : String,
  username : String,
  like: String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_like_media', post_like_media)