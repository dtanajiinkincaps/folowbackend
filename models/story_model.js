require('dotenv').config();
const encrypt = require("../config/encryptdecrypt");
const db=require("../config/db-postgres-connection.config");
const moment=require("moment-timezone");
const user = require('../controllers/user.ctrl');

const storydb={};
storydb.addNewStory=async(data)=>{
    try
    {        
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD  hh:mm:ss a');
        const utc_time = moment.utc().format('YYYY/MM/DD  hh:mm:ss a');

        data.story_id="nextval('next_story_id')";
        data.story_timing=indian_time;
        data.story_utc_timing=utc_time;
        
        const response=await db.insertRecords(data,"stories");

        if(!response.status)
            return response;
        
        const lateststoryQuery="select u.person_name as name,u.username,u.profile_image,story.story_id,story.location,story.story_type, TO_CHAR(story.story_timing,'DD/MM/YYYY HH24:MI:ss am') indian_time, TO_CHAR(story.story_utc_timing,'DD/MM/YYYY HH24:MI:ss am') utc_time,story.media from stories story,users u where story.auth_token=u.auth_token and story.story_id=(select COALESCE(max(story_id),0) story_id from stories where story.auth_token='"+data.auth_token+"')";
        let storyDetails=await db.fetchRecords(lateststoryQuery);

        if(!storyDetails.status)
            return storyDetails;
		storyDetails=storyDetails.msg[0];
		
		storyDetails.username=encrypt.decrypt(storyDetails.username,process.env.salt_string);
		
		for(let i=0;i<storyDetails.media.length;i++)
		{
            storyDetails.media[i].no_of_replies=0;
            storyDetails.media[i].replied_by=[];
        }
        storyDetails.created_by_you=true;
        storyDetails.no_of_views=0;
        storyDetails.viewed_by=[];
        
        return {status:true,success:"Story added successfully",response:{story_media:storyDetails}};

    } catch (error) {
        console.log("Add new story error::",error);
        return {status:false,error:["error::"+error],response:{}}
    }
}
storydb.addNewStoryView=async(data)=>{
    try 
    {
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:mm:ss');
        const utc_time = moment.utc().format('YYYY/MM/DD');

        const storyViewQuery="select * from stories where to_char(story_utc_timing,'YYYY/MM/DD')='"+utc_time+"' and story_id="+data.story_id;

        const storyViewResult=await db.fetchRecords(storyViewQuery);

        if(!storyViewResult.status)
            return storyViewResult;
        if(storyViewResult.msg.length==0)
            return {status:false,error:["Story either expired or not available."],response:{}};

        const storyUserViewQuery="select * from story_actions where story_id="+data.story_id+" and auth_token='"+data.auth_token+"' and story_action='view'";

        const storyUserViewResult=await db.fetchRecords(storyUserViewQuery);

        if(!storyUserViewResult.status)
            return storyUserViewResult;
        if(storyUserViewResult.msg.length>0)
            return {status:false,error:["Story already viewed by current user."],response:{}};
        
        const storyViewObj={
            story_id:data.story_id,
            story_type:"story",
            media_name:"N/A",
            story_indian_time:indian_time,
            story_utc_time:moment.utc().format('YYYY/MM/DD HH:mm:ss'),
            story_action:'view',
            auth_token:data.auth_token
        }

        const addStoryView=await db.insertRecords(storyViewObj,"story_actions");

        if(!addStoryView.status)
            return addStoryView;

        return {status:true,success:"Story view added successfully.",response:{}};
    }
    catch (error)
    {
        console.log("Add new story view error::",error);
        return {status:false,error:["error::"+error],response:{}}
    }
}
storydb.addNewStoryReply=async(data)=>{
    try 
    {
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:mm:ss');
        const utc_time = moment.utc().format('YYYY/MM/DD');

        const storyViewQuery="select * from stories where to_char(story_utc_timing,'YYYY/MM/DD')='"+utc_time+"' and story_id="+data.story_id;

        const storyViewResult=await db.fetchRecords(storyViewQuery);

        if(!storyViewResult.status)
            return storyViewResult;
        if(storyViewResult.msg.length==0)
            return {status:false,error:["Story either expired or not available."],response:{}};

        const storyUserViewQuery="select * from story_actions where story_id="+data.story_id+" and auth_token='"+data.auth_token+"' and story_action='view'";
        
        const storyUserViewResult=await db.fetchRecords(storyUserViewQuery);
        
        if(!storyUserViewResult.status)
            return storyUserViewResult;
        
        if(storyUserViewResult.msg.length==0)
        {
            const storyViewObj={
                story_id:data.story_id,
                story_type:"story",
                media_name:"N/A",
                story_indian_time:indian_time,
                story_utc_time:moment.utc().format('YYYY/MM/DD HH:mm:ss'),
                story_action:'view',
                auth_token:data.auth_token
            }
    
            const addStoryView=await db.insertRecords(storyViewObj,"story_actions");
    
            if(!addStoryView.status)
                return addStoryView;
        }
            
        let mediaFlag=false;
        
        for(let i=0;i<storyViewResult.msg[0].media.length;i++)
        {
            let media=storyViewResult.msg[0].media[i];
            console.log(media);
            if(media.name.indexOf(data.media_name)>-1 && data.type==media.type)
            {
                mediaFlag=true;
                break;
            }
        }
        if(!mediaFlag)
            return {status:false,error:["Media details not found."],response:{}};

        const storyReplyObj={
            story_id:data.story_id,
            story_type:data.type,
            media_name:data.media_name,
            story_indian_time:indian_time,
            story_utc_time:moment.utc().format('YYYY/MM/DD HH:mm:ss'),
            story_action:'reply',
            story_message:data.message,
            auth_token:data.auth_token
        }

        const addStoryReply=await db.insertRecords(storyReplyObj,"story_actions");

        if(!addStoryReply.status)
            return addStoryReply;

        return {status:true,success:"Story reply added successfully.",response:{}};
    }
    catch (error)
    {
        console.log("Add new story reply error::",error);
        return {status:false,error:["error::"+error],response:{}}
    }
}
storydb.getAllStories=async(data)=>{
    try 
    {
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:mm:ss');
        const utc_time = moment.utc().format('YYYY/MM/DD');

        const storyDetails=[];

        let currentUserStory="select u.username,u.person_name as name,u.profile_image,story.story_id,story.location,story.story_type,to_char(story.story_timing,'DD/MM/YYYY HH24:MI:ss') as story_timing,to_char(story.story_utc_timing,'DD/MM/YYYY HH24:MI:ss') as story_utc_timing,story.media,true as created_by_you from stories story,users u where story.auth_token=u.auth_token and to_char(story_utc_timing,'YYYY/MM/DD')='"+utc_time+"' and story.auth_token='"+data.auth_token+"' order by story_id desc";

        let currentUserResult=await db.fetchRecords(currentUserStory);

        console.log("Current user result ",currentUserResult);

        if(!currentUserResult.status)
            return currentUserResult;

        console.log("Different users story ",currentUserResult);

        currentUserResult=currentUserResult.msg;

        for(let i=0;i<currentUserResult.length;i++)
        {
            const media=currentUserResult[i].media;
            
            currentUserResult[i].username=encrypt.decrypt(currentUserResult[i].username,process.env.salt_string);

            const viewQuery="select u.username,u.person_name as name,u.profile_image,sa.story_id,sa.story_type,sa.media_name,to_char(sa.story_indian_time,'DD/MM/YYYY HH24:MI:ss') as story_indian_time,to_char(sa.story_utc_time,'DD/MM/YYYY HH24:MI:ss') as story_utc_time from story_actions sa,stories st,users u where sa.story_id=st.story_id and sa.auth_token=u.auth_token and sa.story_id="+currentUserResult[i].story_id+" sa.story_action='view' order by story_id desc";
                
            const viewResult=await db.fetchRecords(viewQuery);
            
            if(!viewResult.status)
                return viewResult;

            for(let j=0;j<media.length;j++)
            {
                const replyQuery="select u.username,u.person_name as name,u.profile_image,sa.story_id,sa.story_type,sa.media_name,to_char(sa.story_indian_time,'DD/MM/YYYY HH24:MI:ss') as story_indian_time,to_char(sa.story_utc_time,'DD/MM/YYYY HH24:MI:ss') as story_utc_time from story_actions sa,stories st,users u where sa.story_id=st.story_id and sa.auth_token=u.auth_token and sa.story_id="+currentUserResult[i].story_id+" and sa.story_action='reply' and sa.media_name='"+media[i].name+"' order by story_id desc";
                
                const replyResult=await db.fetchRecords(replyQuery);
                
                if(!replyResult.status)
                    return replyResult;

                for(let k=0;k<replyResult.msg.length;k++)
                    replyResult.msg[k].username=encrypt.decrypt(replyResult.msg[k].username,process.env.salt_string);
                
                currentUserResult[i].media[j].no_of_replies=replyResult.msg.length;
                currentUserResult[i].media[j].replied_by=replyResult.msg;
            }
            for(let k=0;k<viewResult.msg.length;k++)
                viewResult.msg[k].username=encrypt.decrypt(viewResult.msg[k].username,process.env.salt_string);
            
            currentUserResult[i].no_of_views=viewResult.msg.length;
            currentUserResult[i].viewed_by=viewResult.msg;
            storyDetails.push(currentUserResult[i])
        }

        let storyViewQuery="select u.username,u.person_name as name,u.profile_image,story.story_id,story.location,story.story_type,to_char(story.story_timing,'DD/MM/YYYY HH24:MI:ss') as story_timing,to_char(story.story_utc_timing,'DD/MM/YYYY HH24:MI:ss') as story_utc_timing,story.media,false as created_by_you from stories story,users u where story.auth_token=u.auth_token and to_char(story_utc_timing,'YYYY/MM/DD')='"+utc_time+"' and story.auth_token <>'"+data.auth_token+"' order by story_id desc";

        let storyViewResult=await db.fetchRecords(storyViewQuery);

        if(!storyViewResult.status)
            return storyViewResult;

        console.log("Different users story ",storyViewResult);
        
        for(let i=0;i<storyViewResult.msg.length;i++)
        {
            // console.log("inside loop");
            let media=storyViewResult.msg[i].media;

            storyViewResult.msg[i].username=encrypt.decrypt(storyViewResult.msg[i].username,process.env.salt_string);

            for(let j=0;j<media.length;j++)
            {
                storyViewResult.msg[i].media[j].no_of_replies=0;
                storyViewResult.msg[i].media[j].replied_by=[];
            }
            storyViewResult.msg[i].no_of_views=0;
            storyViewResult.msg[i].viewed_by=[];
            storyDetails.push(storyViewResult.msg[i]);
        }

        if(storyDetails.length==0)
            return {status:false,error:["No stories available."],response:{}};

        console.log("Story details ",storyDetails);
        return {
            status:true,
            success:"Stories fetched successfully.",
            response:{
                stories_details:storyDetails
            }
        }
    }
    catch (error) 
    {
        console.log("Add new story reply error::",error);
        return {status:false,error:["error::"+error],response:{}} 
    }
}
module.exports=storydb;