var mongoose = require('mongoose');
var post_media = new mongoose.Schema({
  media: [{
    name: { type: String },
    type: { type : String}
  }],
  email: String,
  username: String,
  profile_image: String,
  description: String,
  location: String,
  post_timing: String,
  post_utc_time: String,
  type : String
})
module.exports = mongoose.model('post_media', post_media)