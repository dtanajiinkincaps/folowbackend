var mongoose = require('mongoose');
var setting_list = new mongoose.Schema({
    name : String,
  })
  module.exports = mongoose.model('setting_list', setting_list)