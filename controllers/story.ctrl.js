//NPM Packages
const storyModel=require("../models/story_model");
const userModel=require("../models/user_model");

const stories={};

stories.validateAddStory=async(data)=>{
    try
    {
        data.location=data.location||"";
        data.auth_token=data.auth_token||"";
        
        if(data.location=="")
            data.location="Not mentioned";
        if(data.auth_token=="")
        {
            response.status(200).json({status:false,error:["Auth token cannot be empty."]});
            return;
        }
        
        const verifyResponse=await userModel.verifyUser(data.auth_token);

        if(!verifyResponse.status)
            return verifyResponse;
        
        return {status:true,msg:"Post media validated successfully.",response:data};
    }
    catch (error)
    {
        console.log("Error in validate post media::",error);
        response.status(200).json({status:false,error:["Problem in validating post data."],response:{}});
    }
}
stories.add_story=async(request,response)=>{
    try
    {
        if(!request.files)
        {
            console.log("new story media error ","No files selected");
            response.status(200).json({status:false,error:"No files selected.",response:{}});
            return;
        }
        console.log("new story object :: ",request.body);
        let data=await stories.validateAddStory(request.body);

        if(!data.status)
        {
            console.log("new story validation error ",data);
            response.status(200).json(data);
            return;
        }

        data=data.response;

        console.log("new story object ",data);

        const file_details=request.files.media;

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
        console.log("Story medias",media_details);
        data.media=JSON.stringify(media_details);
        
        if(type.length>1)
            data.story_type="mixed";
        else
            data.story_type=type[0];
        
        const newStoryResponse=await storyModel.addNewStory(data);

        console.log("New story response",newStoryResponse);

        response.status(200).json(newStoryResponse);
    }
    catch (error)
    {
        console.log("add new story error",error);
        response.status(200).json({status:false,error:["Problem in adding a story. Please try after sometime."],response:{}});
    }
}
stories.add_story_View=async(request,response)=>{
    try
    {
        const data=request.body;

        data.story_id=data.story_id||"";
        data.auth_token=data.auth_token||"";

        console.log("Add story view object ",data.auth_token);

        if(data.auth_token=="")
        {
            console.log("stories add story view auth token empty error");
            response.status(200).json({status:false,error:["Auth token cannot be empty."]});
            return;
        }
        if(data.story_id=="")
        {
            console.log("stories add story view story id empty error");
            response.status(200).json({status:false,error:["Story id cannot be empty."]});
            return;
        }
        const verifyResponse=await userModel.verifyUser(data.auth_token);

        if(!verifyResponse.status)
        {
            response.status(200).json(verifyResponse);
            return;
        }
            
        const viewResult=await storyModel.addNewStoryView(data);

        console.log("Add story view result ",viewResult);

        response.status(200).json(viewResult);
    }
    catch (error)
    {
        console.log("Add story view error::",error);
        response.status(200).json({status:false,error:["error::"+error],response:{}});
    }
}
stories.add_story_reply=async(request,response)=>{
    try
    {
        const data=request.body;

        data.story_id=data.story_id||"";
        data.auth_token=data.auth_token||"";
        data.type=data.type||"";
        data.media_name=data.media_name||"";
        data.message=data.message||"";

        console.log("Add story reply object ",data.auth_token);

        if(data.auth_token=="")
        {
            console.log("stories add story reply auth token empty error");
            response.status(200).json({status:false,error:["Auth token cannot be empty."]});
            return;
        }
        if(data.story_id=="")
        {
            console.log("stories add story reply story id empty error");
            response.status(200).json({status:false,error:["Story id cannot be empty."]});
            return;
        }
        if(data.message=="")
        {
            console.log("stories add story reply message empty error");
            response.status(200).json({status:false,error:["Message cannot be empty."]});
            return;
        }
        if(data.type=="")
        {
            console.log("stories add story reply type empty error");
            response.status(200).json({status:false,error:["Media type cannot be empty."]});
            return;
        }
        if(data.media_name=="")
        {
            console.log("stories add story reply media name empty error");
            response.status(200).json({status:false,error:["Media name cannot be empty."]});
            return;
        }

        const verifyResponse=await userModel.verifyUser(data.auth_token);

        if(!verifyResponse.status)
        {
            response.status(200).json(verifyResponse);
            return;
        }

        const replyResult=await storyModel.addNewStoryReply(data);

        console.log("Add story reply result ",replyResult);

        response.status(200).json(replyResult);
    }
    catch (error)
    {
        console.log("Add story reply error::",error);
        response.status(200).json({status:false,error:["error::"+error],response:{}});
    }
}
stories.get_all_stories=async(request,response)=>{
    try
    {
        const data=request.body;

        data.auth_token=data.auth_token||"";

        console.log("Get all stories object ",data);

        if(data.auth_token!="")
        {
            const verifyResponse=await userModel.verifyUser(data.auth_token);
            if(!verifyResponse.status)
            {
                response.status(200).json(verifyResponse);
                return;
            }
        }

        const getAllStoriesResult=await storyModel.getAllStories(data);

        console.log("Get all stories result ",getAllStoriesResult);

        response.status(200).json(getAllStoriesResult);
    }
    catch (error)
    {
        console.log("Get all stories error::",error);
        response.status(200).json({status:false,error:["error::"+error],response:{}});
    }
}
module.exports=stories;