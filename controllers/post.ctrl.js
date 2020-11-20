//NPM Packages
const postModel=require("../models/posts_model");
const userModel=require("../models/user_model");

const posts={};
posts.validatePostMedia=async(data)=>{
    try
    {
        data.description=data.description||"";
        data.location=data.location||"";
        data.auth_token=data.auth_token||"";
        data.hashtags=data.hashtags||"";
        data.mentions=data.mentions||"";
        data.is_hashtags=false;
        data.is_mentions=false;
        
        if(data.location=="")
            data.location="Not mentioned";
        if(data.description=="")
            data.description="Not mentioned";
        // if(data.hashtags=="")
        //     data.hashtags="Not mentioned";
        // if(data.mention=="")
        //     data.mention="Not mentioned";
         if(data.auth_token=="")
            return {status:false,error:["Auth token cannot be empty."]};

        if(data.hashtags!="")
            data.is_hashtags=true;

        if(data.mentions!="")
            data.is_mentions=true;
        
        const verifyResponse=await userModel.verifyUser(data.auth_token);

        if(!verifyResponse.status)
            return verifyResponse;
        
        return {status:true,msg:"Post media validated successfully.",response:data};
    }
    catch (error)
    {
        console.log("Error in validate post media::",error);
        return {status:false,error:["Problem in validating post data."],response:{}};
    }
}
posts.validatePostLike=async(data)=>{
    try
    {
        
        if(data.auth_token=="")
        {
            return {status:false,error:["Api key cannot be empty."],response:{}};    
        }
        const verifyUser=await userModel.verifyUser(data.auth_token);

        if(!verifyUser.status)
        {   
            verifyUser.response={auth_token:data};
            return verifyUser;
        }
        if(data.type=="")
        {
            return {status:false,error:["Post type cannot be empty."],response:{}}
        }    
        if(data.type!="post" && data.post_name=="")
        {
            return {status:false,error:["Post name cannot be empty."],response:{}};
        }
        if(data.like.toString()=="")
            return {status:false,error:["Like parameter cannot be empty."],response:{}};

        return {status:true,success:["Successfully validated."],response:{}};
    }
    catch (error)
    {
        console.log("validatePostLike function error",error)
        return {status:false,error:["error::"+error],response:{}};
    }
}
posts.validatePostComment=async(data)=>{
    try
    {
        data.auth_token=data.auth_token||"";
        data.type=data.type||"";
        data.post_name=data.post_name||"";
        data.type=data.type||"";
        data.comment=data.comment||"";
        data.post_id=data.post_id||"";

        if(data.post_id=="")
        {
            return {status:false,error:["Post id cannot be empty."],response:{}}
        }
        
        if(data.auth_token=="")
        {
            return {status:false,error:["Api key cannot be empty."],response:{}};    
        }
        const verifyUser=await userModel.verifyUser(data.auth_token);

        if(!verifyUser.status)
        {   
            verifyUser.response={auth_token:data};
            return verifyUser;
        }
        if(data.type=="")
        {
            return {status:false,error:["Post type cannot be empty."],response:{}}
        }    
        if(data.type!="post" && data.post_name=="")
        {
            return {status:false,error:["Post name cannot be empty."],response:{}};
        }
        if(data.comment=="")
            return {status:false,error:["Comment cannot be empty."],response:{}};

        return {status:true,success:"Successfully validated.",response:{}};
    }
    catch (error)
    {
        console.log("validatePostComment function error",error)
        return {status:false,error:["error"+error],response:{}};
    }
}
posts.validateCommentReply=async(data)=>{
    try
    {
        data.auth_token=data.auth_token||"";
        data.type=data.type||"";
        data.post_name=data.post_name||"";
        data.comment=data.comment||"";
        data.post_id=data.post_id||"";
        data.comment_id=data.comment_id||"";

        
        if(data.auth_token=="")
        {
            return {status:false,error:["Api key cannot be empty."],response:{}};    
        }
        const verifyUser=await userModel.verifyUser(data.auth_token);

        if(!verifyUser.status)
        {   
            verifyUser.response={auth_token:data};
            return verifyUser;
        }
        if(data.post_id=="")
        {
            return {status:false,error:["Post id cannot be empty."],response:{}}
        }
        if(data.post_id=="")
        {
            return {status:false,error:["Comment id cannot be empty."],response:{}}
        }
        if(data.type=="")
        {
            return {status:false,error:["Post type cannot be empty."],response:{}}
        }    
        if(data.type!="post" && data.post_name=="")
        {
            return {status:false,error:["Post name cannot be empty."],response:{}};
        }
        if(data.comment=="")
            return {status:false,error:["Comment cannot be empty."],response:{}};

        return {status:true,success:"Successfully validated.",response:{}};
    }
    catch (error)
    {
        console.log("validateCommentReply function error",error)
        return {status:false,error:["error"+error],response:{}};
    }
}
posts.getFetchObject=(data)=>{
    try
    {
        data.name=data.name||"";
        data.email=data.email||"";
        data.username=data.username||"";
        data.auth_token=data.auth_token||"";
    }
    catch (error)
    {
        console.log("Error in getFetchObject function::",error);
        return {status:false,error:["Problem in getting posts."],response:{}};
    }
}
posts.post_media=async(request,response)=>{
    try
    {
        if(!request.files)
        {
            console.log("new post media error ","No files selected");
            response.status(200).json({status:false,error:"No files selected.",response:{}});
            return;
        }
        console.log("new post object :: ",request.body);
        let data=await posts.validatePostMedia(request.body);

        if(!data.status)
        {
            console.log("new post validation error ",data);
            response.status(200).json(data);
            return;
        }

        data=data.response;

        let postObj={
            description:data.description,
            location:data.location,
            auth_token:data.auth_token,
            hashtags:data.hashtags,
            mentions:data.mentions
        }

        console.log("new post object ",data);

        const file_details=request.files.media;

        // console.log("Media files details::",file_details);

        const media_details=[];

        const type=[];

        for(let i=0;i<file_details.length;i++)
        {
            let mimetype=file_details[i].mimetype;
            let filetype=mimetype.substr(0,mimetype.lastIndexOf("/"));
            if(!type.includes(filetype))
                type.push(filetype);
            
            media_details.push({
                name:file_details[i].key,
                location:file_details[i].location,
                type:filetype,
                seq:(i+1)
            });
        }
        // console.log(media_details);
        postObj.media=JSON.stringify(media_details);
        
        if(type.length>1)
            postObj.post_type="mixed";
        else
            postObj.post_type=type[0];
        
        const newPostResponse=await postModel.addNewPost(postObj,{is_hashtags:data.is_hashtags,hashtags:data.hashtags,is_mentions:data.is_mentions,mentions:data.mentions});

        console.log("New post response",newPostResponse);

        response.status(200).json(newPostResponse);
    }
    catch (error)
    {
        console.log(error);
        response.status(200).json({status:false,error:["Problem in posting a post. Please try after sometime."],response:{}});
    }
}
posts.get_all_post=async(request,response)=>{
    try
    {
        console.log("Inside get all post.");
        const data=request.body;
        console.log("get all data object from user",data);
        data.auth_token=data.auth_token||"";
        if(data.auth_token!="")
        {
            const verifyResponse=await userModel.verifyUser(data.auth_token);

            if(!verifyResponse.status)
            {
                console.log("Get all post auth token error",verifyResponse);
                response.status(200).json(verifyResponse);
                return;
            }
        }

        data.name=data.name||"";
        data.email=data.email||"";
        data.username=data.username||"";
        data.auth_token=data.auth_token||"";
        data.description=data.description||"";
        data.location=data.location||"";
        data.post_date=data.post_date||"";
        data.post_utc_date=data.post_utc_date||"";
        data.current_user=data.single_user||false

        console.log("data generated::",data);

        const postResponse=await postModel.getAllPosts(data);

        console.log("post response",postResponse);

        response.status(200).json(postResponse);
    }
    catch (error)
    {
        console.log("Get all post error ",error);
        response.status(200).json({status:false,error:["Problem in getting post records."],response:{}})
    }
}
posts.post_like=async(request,response)=>{
    try
    {
        const data=request.body;
        console.log("Post like object ",data);
        const validate=await posts.validatePostLike(data);
        if(!validate.status)
        {
            console.log("Post validate error ",validate);
            response.status(200).json(validate);
            return;
        }
        const verifyResponse=await userModel.verifyUser(data.auth_token);

        if(!verifyResponse.status)
        {
            console.log("Post like post auth token error",verifyResponse);
            response.status(200).json(verifyResponse);
            return;
        }
        // if(data.like=="0")
        // {
            const likeResponse=await postModel.addNewLike(data);
            // console.log("like post response",likeResponse);
            response.status(200).json(likeResponse);
        // }
        // else if(data.like=="1")
        // {
        //     const dislikeResponse=await postModel.addNewDislike(data);
        //     console.log("Dislike post response",dislikeResponse);
        //     response.status(200).json(dislikeResponse);
        // }
        // else
        // {
        //     response.status(200).json({status:false,error:["Please like or dislike a post."],response:{}});
        // }
    }
    catch (error)
    {
        console.log("Post like error::",error);
        response.status(200).json({status:false,error:["Problem in like a post."],response:{}});
    }
}
posts.post_comment=async(request,response)=>{
    try
    {
        const data=request.body;
        console.log("Post comment object.",data);
        const validate=await posts.validatePostComment(data);
        if(!validate.status)
        {
            console.log("post comment validation error ",validate);
            response.status(200).json(validate);
            return;
        }

        const commentResponse=await postModel.addNewComment(data);
        console.log("Comment response",commentResponse);
        response.status(200).json(commentResponse);
    }
    catch (error)
    {
        console.log("post comment error",error);
        response.status(200).json({status:false,error:["Problem in comment a post."],response:{}});
    }
}
posts.fetch_profile_post=async(request,response)=>{
    try
    {
        console.log("new story object :: ",request.body);
        
        const data=request.body;
        data.auth_token=data.auth_token||"";
        data.username=data.username||"";

        if(data.auth_token=="")
        {
            console.log("Fetch profile post auth token empty error");
            response.status(200).json({status:false,error:["Auth token cannot be empty."],response:{}});
            return;
        }
        const verifyResponse=await userModel.verifyUser(data.auth_token);

        if(!verifyResponse.status)
        {
            console.log("Fetch profile post auth token error",verifyResponse);
            response.status(200).json(verifyResponse);
            return;
        }

        const profileFetchResult=await postModel.fetchProfilePost(data);

        console.log("Fetched post details",profileFetchResult);

        response.status(200).json(profileFetchResult);
    }
    catch (error)
    {
        console.log("fetch profile post error",error);
        response.status(200).json({status:false,error:["Problem in fetching user profiles post. Please try after sometime."],response:{}});
    }
}
posts.comment_reply=async(request,response)=>{
    try 
    {
        console.log("new comment reply object :: ",request.body);
        
        const data=request.body;
        
        const validateCommentReply=await posts.validateCommentReply(data);

        if(!validateCommentReply.status)
        {
            console.log("Comment reply validation error",validateCommentReply);
            response.status(200).json(validateCommentReply);
            return;
        }

        const commentReplyResponse=await postModel.replyToComment(data);

        console.log("Comment reply response::",commentReplyResponse);

        response.status(200).json(commentReplyResponse);

    } catch (error) {
        console.log("Comment reply error",error);
        response.status(200).json({status:false,error:["Problem in replying comment. Please try after sometime."],response:{}});
    }
}
module.exports=posts;