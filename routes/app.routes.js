const userCtrl = require('../controllers/user.ctrl');
const postCtrl = require('../controllers/post.ctrl');
const settingCtrl = require('../controllers/setting.ctrl');
const storyCtrl = require('../controllers/story.ctrl');
const upload=require("../config/upload-file.config");

var path = require("path");


const multer = require('multer');
const fs = require('fs');

const jwt = require('../config/jwt.config');
const { request } = require('express');


module.exports = (app,passport) => {
	app.post('/',(request,response)=>{
		response.sendFile("../views/login.html");
	});
	app.get('/',(request,response)=>{
        
        response.sendFile(path.resolve("./views/login.html"));
		// response.sendFile("./views/login.html");
    });
    app.get('/app/linkedin',(request,response)=>{
        response.writeHead(301,{"Location":"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=781sh4fd3d4jyz&redirect_uri=https%3A%2F%2Ffolow-backend.inkincaps.com%2Fapp%2Flinkedin%2Fcode&state="+process.env.salt_string+"&scope=r_liteprofile%20r_emailaddress%20w_member_social"});
        response.end();
    })
    app.get('/app/linkedin/code',(request,response)=>{
        const url="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id="+process.env.linkedin_id+"&redirect_uri=https%3A%2F%2Ffolow-backend.inkincaps.com%2Fapp%2Flinkedin%2Fauth&state="+process.env.salt_string+"&scope=r_liteprofile%20r_emailaddress%20w_member_social";
        console.log("Body ",request.body);
        console.log("Paramter ",request.params);
        console.log("query paramters ::: ",request.query);
        const data=request.query;
        data.code=data.code||"";
        data.state=data.state||"";
        data.error=data.error||"";

        if(data.code!="")
        {
            response.writeHead(301,{"Location":url});
            response.end();
        }
        else
            response.json({status:false,error:[data.error]});
    });
    app.get('/app/linkedin/auth',(request,response)=>{
        console.log("Body ",request.body);
        console.log("Paramter ",request.params);
        console.log("query paramters ::: ",request.query);
        const data=request.query||{};
        console.log("Authorization token :: ",data);
        response.json(data);
    });

    app.get("/app/twitter/login",passport.authenticate("twitter"));

    app.get("/app/twitter/return",passport.authenticate('twitter',{
        failureRedirect:"/app/twitter/error"
    }),(request,response)=>{
        response.json({status:true,msg:"Twitter login successfully done.",response:{user:request.user}});
    });
    
    app.get("/app/twitter/error",(request,response)=>{
        response.json({status:false,error:["Login failed."],response:{}});
    });
    ////////// userCtrl
    app.post('/app/register',upload, userCtrl.registerUser);
    app.post('/app/login', upload,userCtrl.loginUser);
    app.post('/app/send_otp',upload,userCtrl.resend_otp);
    app.post('/app/forgot_password',upload, userCtrl.resend_otp);
    app.post('/app/reset_password',upload, userCtrl.resetPassword);
    app.post('/app/user_verify',upload, userCtrl.user_verify);
    app.post('/app/social_login', upload,userCtrl.social_login);

    app.post('/app/user_detail', upload,userCtrl.user_detail);
    app.post('/app/update_user_profile', upload,userCtrl.update_user_profile);
    app.post('/app/user_profiling', userCtrl.user_profiling);
    // app.post('/app/get_user_profiling_by_id', userCtrl.get_user_profiling_by_id);
    app.post("/app/follow_to_user",userCtrl.user_follow);
    app.post("/app/get_followers",userCtrl.user_follower_list);
    app.post("/app/get_following",userCtrl.user_following_list);


    ///////// postCtrl
    // app.post('/app/post_images', postCtrl.post_images);
    // app.post('/app/post_videos', postCtrl.post_videos);

    app.post('/app/post_like', upload,postCtrl.post_like);
    // app.post('/app/post_like', postCtrl.post_like_2);

    app.post('/app/post_comment', upload,postCtrl.post_comment);
    // app.post('/app/post_comment', postCtrl.post_comment_2);

    app.post('/app/post_media',upload, postCtrl.post_media);

    //storyCtrl
    app.post('/app/add_story',upload, storyCtrl.add_story);
    app.post('/app/add_story_reply',upload, storyCtrl.add_story_reply);
    app.post('/app/add_story_view',upload, storyCtrl.add_story_View);
    app.get('/app/get_all_stories',upload, storyCtrl.get_all_stories); 
    app.post('/app/get_all_stories',upload, storyCtrl.get_all_stories); 
    
    /// post_media_test
    // app.post('/app/post_media_test', postCtrl.post_media_test);
    // app.post('/app/get_all_media_after_login', postCtrl.get_all_media_after_login);
    // app.post('/app/get_all_media_after_login', postCtrl.get_all_media_after_login_2);
    app.post('/app/get_all_media_after_login',upload, postCtrl.get_all_post);

    // app.post('/app/get_post_like_detail', postCtrl.get_post_like_detail);
    // app.post('/app/get_post_like_detail', postCtrl.get_post_like_detail_2);

    // app.post('/app/get_post_comment_detail', postCtrl.get_post_comment_detail);
    // app.post('/app/get_post_comment_detail', postCtrl.get_post_comment_detail_2);
    
    // get_post_details

    // app.post('/app/get_post_details', postCtrl.get_post_details);
    
    
    // app.post('/app/delete_post_comment', postCtrl.delete_post_comment);
    
    app.get('/app/get_all_post',upload, postCtrl.get_all_post); 
    app.post('/app/get_all_post',upload, postCtrl.get_all_post);
    app.post('/app/user_profile_post',upload, postCtrl.fetch_profile_post);
    app.post('/app/profile_search',upload, userCtrl.profile_search);
    app.post('/app/hashtags_search',upload, userCtrl.hashtags_search);
    app.post('/app/hashtag_profile',upload, userCtrl.hashtag_profile);
    
    
    // app.get('/app/get_all_media', postCtrl.get_all_media);
    // app.get('/app/get_all_media', postCtrl.get_all_media_2);
    // app.get('/app/get_all_media_test', postCtrl.get_all_media_test);

    // app.get('/app/get_all_comment', postCtrl.get_all_comment);
    /// settingCtrl

    // app.get('/app/get_setting_list', settingCtrl.get_setting_list);
    // app.post('/app/add_setting_list', settingCtrl.add_setting_list);
    // app.post('/app/invite', settingCtrl.invite);
    // app.post('/app/features', settingCtrl.features);
    // app.post('/app/account', settingCtrl.account);
    // app.post('/app/privacy_security', settingCtrl.privacy_security);
    // app.post('/app/account_privacy', settingCtrl.account_privacy);
    // app.post('/app/visible_likes', settingCtrl.visible_likes);
    // app.post('/app/block_list', settingCtrl.block_list);
    // app.post('/app/content_liked', settingCtrl.content_liked);
    // app.post('/app/authentication_options', settingCtrl.authentication_options);
    // app.post('/app/data_download', settingCtrl.data_download);
    // app.post('/app/manage_subscribers', settingCtrl.manage_subscribers);
    // app.post('/app/notifications', settingCtrl.notifications);
    // app.post('/app/support', settingCtrl.support);
    
    
}
