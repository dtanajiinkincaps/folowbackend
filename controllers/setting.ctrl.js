//NPM Packages

//Configuration Modules

//Models
var setting_list = require('../models/application/setting_list');
module.exports =
{
    add_setting_list : async function(req, res){
        var add_list =await setting_list.create({ name : req.body.name});
        if(add_list){
            res.status(200).send({ status :true, success : "Successfully added new list", response : { list : add_list}})
        }else{
            res.status(200).send({ status :false, error : "Not added successfully."})
        }
    },
    get_setting_list : async function(req, res){
        var all_list  = await setting_list.find({},{_id : 0, __v : 0});
        if(all_list.length > 0){
            res.status(200).send({ status : true,response :  {setting_list : all_list}})
        }else{
            res.status(200).send({ status : false, setting_list : all_list})
        }
    },
    invite : async function(req, res){
        res.status(200).send({ status : true, success: "You called Invite "})
    },
    features : async function(req, res){
        res.status(200).send({ status : true, success: "You called features "})
    },
    account : async function(req, res){
        res.status(200).send({ status : true, success: "You called account "})
    },
    privacy_security : async function(req, res){
        res.status(200).send({ status : true, success: "You called Privacy and Security "})
    },
    account_privacy : async function(req, res){
        res.status(200).send({ status : true, success: "You called Account Privacy "})
    },
    visible_likes : async function(req, res){
        res.status(200).send({ status : true, success: "You called Visible Likes "})
    },
    block_list : async function(req, res){
        res.status(200).send({ status : true, success: "You called Block List  "})
    },
    content_liked : async function(req, res){
        res.status(200).send({ status : true, success: "You called Content you Liked "})
    },
    authentication_options : async function(req, res){
        res.status(200).send({ status : true, success: "You called Authentication Options "})
    },
    data_download : async function(req, res){
        res.status(200).send({ status : true, success: "You called Data Download "})
    },
    manage_subscribers : async function(req, res){
        res.status(200).send({ status : true, success: "You called Manage Subscribers "})
    },
    notifications : async function(req, res){
        res.status(200).send({ status : true, success: "You called Notifications "})
    },
    support : async function(req, res){
        res.status(200).send({ status : true, success: "You called Support "})
    },
}