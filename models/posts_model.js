require('dotenv').config();
const encrypt = require("../config/encryptdecrypt");
const db=require("../config/db-postgres-connection.config");
const moment=require("moment-timezone");
const user = require('../controllers/user.ctrl');

const postsdb={};

postsdb.addNewPost=async(data,otherObj)=>{
    try
    {    
        console.log("Add new post object:::",data);
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD  hh:mm:ss a');
        const utc_time = moment.utc().format('YYYY/MM/DD  hh:mm:ss a');

        data.post_id="nextval('next_post_id')";
        data.post_timing=indian_time;
        data.post_utc_timing=utc_time;
        
        const response=await db.insertRecords(data,"posts");

        if(!response.status)
            return response;

        console.log("Other object ::: ",otherObj);

        if(otherObj.is_hashtags)
        {
            const hashTags=await db.procedureCall(["'"+otherObj.hashtags+"'","'"+utc_time+"'"],'pro_addorupdate_hashtag');
            
            if(!hashTags.status)
                return hashTags;
        }
        if(otherObj.is_mentions)
        {
            const mentionTags=await db.procedureCall(["'"+otherObj.mentions+"'","'"+utc_time+"'"],'pro_addorupdate_mentions');
            
            if(!mentionTags.status)
                return mentionTags;
        }
        
        const latestPostQuery="select u.person_name as name,u.username,u.profile_image,post.post_id,post.description,post.location,post.post_type, TO_CHAR(post.post_timing,'DD/MM/YYYY HH24:MI:ss am') indian_time, TO_CHAR(post.post_utc_timing,'DD/MM/YYYY HH24:MI:ss am') utc_time,post.media,post.comments,post.likes total_likes,post.comments total_comments,COALESCE(hashtags,'') hashtags,COALESCE(mentions,'') mentions from posts post,users u where post.auth_token=u.auth_token and post.post_id=(select COALESCE(max(post_id),0) post_id from posts where auth_token='"+data.auth_token+"')";
        let postDetails=await db.fetchRecords(latestPostQuery);

        if(!postDetails.status)
            return postDetails;
		postDetails=postDetails.msg[0];
		
		postDetails.username=encrypt.decrypt(postDetails.username,process.env.salt_string);
		
		for(let i=0;i<postDetails.media.length;i++)
		{
			postDetails.media[i].total_likes="0";
			postDetails.media[i].liked_by=[];
			postDetails.media[i].total_comments="0";
			postDetails.media[i].commented_by=[];
			postDetails.liked_by_you=0;
		}
		postDetails.liked_by=[];
		postDetails.commented_by=[];
		postDetails.liked_by_you=0;
        
        return {status:true,success:"Post added successfully",response:{post_media:postDetails}};

    } catch (error) {
        console.log("Add new post error::",error);
        return {status:false,error:["error::"+error],response:{}}
    }
}
postsdb.getAllPosts=async(data)=>{
    try
    {
        let condition="1=1";
        if(data.name!="")
            condition+=" and u.person_name like '"+data.name+"%'";
        if(data.email!="")
            condition+=" and u.email_id='"+encrypt.encryptWithStringSalt(data.email,process.env.salt_string)+"'";
        if(data.username!="")
            condition+=" and u.username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"'";
        if(data.description!="")
            condition+=" and lower(post.description) like '%"+data.description.toLowerCase()+"%'";
        if(data.location!="")
            condition+=" and lower(post.location) like '%"+data.location.toLowerCase()+"%'";
        if(data.post_date!='')
            condition+=" and TO_CHAR(post.post_timing,'YYYY/MM/DD')='"+data.post_date+"'";
        if(data.post_utc_date!="")
            condition+=" and TO_CHAR(post.post_utc_timing,'YYYY/MM/DD')= '"+data.post_utc_date+"'";
        if(data.hashtag!="")
            condition+=" and lower(hashtags) like '%"+data.hashtag.toLowerCase()+"%'"
        
        const query="select u.person_name as name,u.username,u.profile_image,post.post_id,post.description,post.location,post.post_type, TO_CHAR(post.post_timing,'DD/MM/YYYY HH24:MI:ss') indian_time, TO_CHAR(post.post_utc_timing,'DD/MM/YYYY HH24:MI:ss') utc_time,post.media,post.comments,post.likes total_likes,post.comments total_comments,(select count(*) from post_likes where post_id=post.post_id and like_type='post' and auth_token='"+data.auth_token+"') liked_by_you,COALESCE(hashtags,'') hashtags,COALESCE(mentions,'') mentions, (post.auth_token='"+data.auth_token+"') as is_self from posts post,users u where post.auth_token=u.auth_token and "+condition+" order by post.post_id DESC  ";
    
        const response=await db.fetchRecords(query);

        if(!response.status)
            return response;
        
        let postDetails=response.msg;

        for(let i=0;i<postDetails.length;i++)
        {
            postDetails[i].username=encrypt.decrypt(postDetails[i].username,process.env.salt_string);
            
            const likeByQuery="select u.username,u.person_name,u.profile_image from post_likes likes,users u,posts post where likes.post_id=post.post_id and likes.auth_token=u.auth_token and likes.like_type='post' and likes.post_id="+postDetails[i].post_id+";"

            let likeByResult=await db.fetchRecords(likeByQuery);

            if(!likeByResult.status)
                return likeByResult;
            likeByResult=likeByResult.msg;
            // console.log(likeByResult);
            for(let j=0;j<likeByResult.length;j++)
            {
                likeByResult[j].username=encrypt.decrypt(likeByResult[j].username,process.env.salt_string);
            }

            const commentByQuery="select u.username,u.person_name,u.profile_image from post_comments comment,users u,posts post where comment.post_id=post.post_id and comment.auth_token=u.auth_token and comment.comment_type='post' and comment.post_id="+postDetails[i].post_id+";"

            let commentResult=await db.fetchRecords(commentByQuery);

            if(!commentResult.status)
                return commentResult;

            commentResult=commentResult.msg;

            for(let j=0;j<commentResult.length;j++)
            {
                commentResult[j].username=encrypt.decrypt(commentResult[j].username,process.env.salt_string);
            }

            let media=postDetails[i].media;

            for(let j=0;j<media.length;j++)
            {
                const mediaLikes="select likes.post_id,likes.like_type post_type,likes.post_name,u.username,u.person_name,u.profile_image,(select count(*) from post_likes where post_id=likes.post_id and like_type=likes.like_type and post_name=likes.post_name and auth_token='"+data.auth_token+"') liked_by_you from post_likes likes,users u,posts post where likes.post_id=post.post_id and likes.auth_token=u.auth_token and likes.like_type='"+media[j].type+"' and likes.post_name='"+media[j].name+"' and likes.post_id="+postDetails[i].post_id+";";

                
                
                const mediaLikesResult=await db.fetchRecords(mediaLikes);

                if(!mediaLikesResult.status)
                    return mediaLikesResult;
                
                for(let k=0;k<mediaLikesResult.msg.length;k++)
                {
                    mediaLikesResult.msg[k].username=encrypt.decrypt(mediaLikesResult.msg[k].username,process.env.salt_string);
                }
                response.msg[i].media[j].total_likes=mediaLikesResult.msg.length;
                response.msg[i].media[j].liked_by=mediaLikesResult.msg;
                if(mediaLikesResult.msg.length>0)
                    response.msg[i].media[j].liked_by_you=mediaLikesResult.msg[0].liked_by_you;
                else
                    response.msg[i].media[j].liked_by_you="0";

                const mediaComment="select comments.post_id,comments.comment_type post_type,comments.post_name,u.username,u.person_name,u.profile_image from post_comments comments,users u,posts post where comments.post_id=post.post_id and comments.auth_token=u.auth_token and comments.comment_type='"+media[j].type+"' and comments.post_name='"+media[j].name+"' and comments.post_id="+postDetails[i].post_id +";";
                
                const mediaCommentResult=await db.fetchRecords(mediaComment);

                if(!mediaCommentResult.status)
                    return mediaCommentResult;
                
                for(let k=0;k<mediaCommentResult.msg.length;k++)
                {
                    mediaCommentResult.msg[k].username=encrypt.decrypt(mediaCommentResult.msg[k].username,process.env.salt_string);
                }
                response.msg[i].media[j].total_comments=mediaCommentResult.msg.length;
                response.msg[i].media[j].commented_by=mediaCommentResult.msg;
            }

            response.msg[i].liked_by=likeByResult;
            response.msg[i].commented_by=commentResult;

        }
        if(response.msg.length==0)
            return {status:false,error:["No post found."],response:{post:[]}}
        
        return {status:true,success:"Post fetched successfully.",response:{post:response.msg}};
    }
    catch(error)
    {
        console.log("Error in getAllPosts function ",error);
        return {status:false,error:["Problem in fetching all posts"],response:{}};
    }
}
postsdb.addNewLike=async(data)=>{
    try
    {
        console.log("inside like");
        const postQuery="select * from posts where post_id="+data.post_id;
        let response=await db.fetchRecords(postQuery);

        if(!response.status)
            return response;
        if(response.msg.length==0)
            return {status:false,error:["Post not found. Wrong post id provided."],response:{}};
        response=response.msg;

        console.log(response);

        if(data.type!='post')
        {
            let mediaFlag=false;
            const media=response[0].media;
            for(let i=0;i<media.length;i++)
            {
                if(media[i].name.indexOf(data.post_name)>-1 && media[i].type==data.type)
                {
                    mediaFlag=true;
                    break;
                }
            }
            if(!mediaFlag)
                return {status:false,error:["Post name not found on given type."],response:{}};
        }
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD  HH:mm:ss');
        const utc_time = moment.utc().format('YYYY/MM/DD  HH:mm:ss');
        const likeObj={
            post_id:data.post_id,
            auth_token:data.auth_token,
            like_date:indian_time,
            like_utc_date:utc_time,
            like_type:data.type,
            post_name:(data.type=="post")?response[0].description:data.post_name,
        }
        const checkCount=await db.fetchRecords("select count(*) total_likes from post_likes where like_type='"+data.type+"' and post_name='"+likeObj.post_name+"' and auth_token='"+data.auth_token+"'");
        
        if(!checkCount.status)
            return checkCount;
        if(checkCount.msg[0].total_likes > 0)
            return {status:false,error:["Post already liked by user."],response:{}};

        let insertlike=await db.insertRecords(likeObj,"post_likes");

        if(!insertlike.status) 
            return insertlike;
        
        if(data.type=="post")
        {
            const likeResult = await db.updateRecords({likes:"likes+1"},"posts","post_id="+data.post_id);
            
            if(!likeResult.status)
                return likeResult;
        }
         
        return {
            status:true,
            success:"Post liked successfully.",
            response:{},
        };   
    }
    catch (error)
    {
        console.log("add_new_like function error ",error);
        return {status:false,error:["Problem in liking post. Please try later"],response:{}};
    }
}
postsdb.addNewDislike=async(data)=>{
    try
    {
        console.log("inside dislike");
        const postQuery="select * from posts where post_id="+data.post_id;
        let response=await db.fetchRecords(postQuery);

        if(!response.status)
            return response;
        if(response.msg.length==0)
            return {status:false,error:["Post not found. Wrong post id provided."],response:{}};
        response=response.msg;

        if(data.type!='post')
        {
            let mediaFlag=false;
            const media=response.media;
            for(let i=0;i<media.length;i++)
            {
                if(media[i].name.indexOf(data.post_name)>-1 && media[i].type==data.type)
                {
                    mediaFlag=true;
                    break;
                }
            }
            if(!mediaFlag)
                return {status:false,error:["Post name not found on given type."],response:{}};
        }
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD  hh:mm:ss a');
        const utc_time = moment.utc().format('YYYY/MM/DD  hh:mm:ss a');
        const likeObj={
            post_id:data.post_id,
            auth_token:data.auth_token,
            like_date:indian_time,
            like_utc_date:utc_time,
            like_type:data.type,
            post_name:(data.type=="post")?response[0].description:data.post_name,
        }
        const condition=" like_type='"+data.type+"' and post_name='"+likeObj.post_name+"' and auth_token='"+data.auth_token+"'";
        const checkCount=await db.fetchRecords("select count(*) total_likes from post_likes where 1=1 and "+condition);

        if(!checkCount.status)
            return checkCount;
        
        if((await checkCount).msg[0].total_likes == 0)
            return {status:false,error:["Post already disliked by user."],response:{}};

        let dislikeResponse=await db.deleteRecords("post_likes",condition);
        if(!dislikeResponse.status)
            return dislikeResponse;

        if(data.type=="post")
        {
            const dislikeResult = await db.updateRecords({likes:"likes-1"},"posts","post_id="+data.post_id);
            
            if(!dislikeResult.status)
                return dislikeResult;
        }
         
        return {status:true,success:"Post disliked successfully.",response:{}};
    }
    catch (error)
    {
        console.log("add_new_dislike function error ",error);
        return {status:false,error:["Problem in disliking post. Please try later"],response:{}};
    }
}
postsdb.addNewComment=async(data)=>{
    try
    {
        console.log("inside comment");
        const postQuery="select * from posts where post_id="+data.post_id;
        let response=await db.fetchRecords(postQuery);
        if(!response.status)
            return response;
        response=response.msg;
        if(data.type!='post')
        {
            let mediaFlag=false;
            const media=response[0].media;
            console.log(media);
            for(let i=0;i<media.length;i++)
            {
                if(media[i].name.indexOf(data.post_name)>-1 && media[i].type==data.type)
                {
                    mediaFlag=true;
                    break;
                }
            }
            if(!mediaFlag)
                return {status:false,error:["Post name not found on given type."],response:{}};
        }
        const comment_id_query="select COALESCE(max(comment_id),0)+1 comment_id from post_comments where post_id="+data.post_id+" and comment_type='"+data.post_type+"'";
        let idResponse=await db.fetchRecords(comment_id_query);
        
        if(!idResponse.status)
            return idResponse;
        idResponse=idResponse.msg[0];

        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD  hh:mm:ss a');
        const utc_time = moment.utc().format('YYYY/MM/DD  hh:mm:ss a');
        const commentObj={
            post_id:data.post_id,
            comment_id:idResponse.comment_id,
            auth_token:data.auth_token,
            comment_date:indian_time,
            comment_utc_date:utc_time,
            comment_type:data.type,
            post_name:(data.type=="post")?response[0].description:data.post_name,
            comment:data.comment
        }
        console.log("Comment insert object",commentObj);
        let insertComment=await db.insertRecords(commentObj,"post_comments");

        if(!insertComment.status)
            return insertComment;
        
        if(data.type=="post")
        {
            const commentResult = await db.updateRecords({comments:"comments+1"},"posts","post_id="+data.post_id);
                
            if(!commentResult.status)
                return commentResult;
        }
        return {
            status:true,
            success:"Comment added successfully.",
            response:{}
        }
    }
    catch (error)
    {
        console.log("addNewComment function error ",error);
        return {status:false,error:["Problem in commenting a post. Please try later"],response:{}};
    }
}
postsdb.fetchProfilePost=async(data)=>{

    let postQuery="select post.post_id,post.description,post.location,post.post_type as type,post.post_timing timing,post.post_utc_timing utc_timing,post.media from posts post,users u where post.auth_token=u.auth_token ";

    let condition="and 1=1 ";

    if(data.username!="")
        condition+="and u.username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"'";
    else if(data.auth_token!="")
        condition+="and u.auth_token='"+data.auth_token+"'";
    else
        return {status:false,error:["Either username or auth token required. Both cannot be empty."],response:{}}

    postQuery+=condition;

    const postResponse=await db.fetchRecords(postQuery);

    if(!postResponse.status)
        return {status:false,error:["Problem in fetching post details."],response:{}};

    if(postResponse.msg.length==0)
        return {status:false,error:["No post found."],response:{}};

    return {
        status:true,
        success:"Post fetched successfully.",
        response:{
            post_details:{
                "posts":postResponse.msg.length,
                "post_media":postResponse.msg
            }
        }
    }
}
module.exports=postsdb;