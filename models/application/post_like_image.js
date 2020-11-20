var mongoose = require('mongoose');
var post_like_image = new mongoose.Schema({
  image: String,
  image_id : String,
  email : String,
  username : String,
  like: String,
  post_like : String,
  timing: String,
  utc_time: String,
  type : String
})
module.exports = mongoose.model('post_like_image', post_like_image)