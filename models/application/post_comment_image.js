var mongoose = require('mongoose');
var post_comment_image = new mongoose.Schema({
  image: String,
  image_id : String,
  email : String,
  username: String,
  comment: String,
  post_comment : String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_comment_image', post_comment_image)