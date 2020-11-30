require('dotenv').config();
const randomstring=require("randomstring");
const randomnumber=require("random-number");
const userModel=require("../models/user_model");
const dateTime=require("../config/date");
const send_email=require("../config/send-email.config");
const encrypt=require("../config/encryptdecrypt");
const postModel=require("../models/posts_model");

const user={};

user.validateUserRegistration=async (data)=>{
    let error=[];
    try
    {
      data.username=data.username||"";
      data.name=data.name||"Not mentioned";
      data.email_id=data.email_id||"";
      data.mobile_number=data.mobile_number||"Not mentioned";
      data.gender=data.gender||"Not mentioned";
      data.password=data.password||"";
      data.random=data.random||randomstring.generate(6);
      data.about_me=data.about_me||"Not mentioned";
      data.date_of_birth=data.date_of_birth||"";

      if(data.username=="")
        error.push("Username cannot be empty.");
      if(data.password=="")
        error.push("Password cannot be empty.");
      if(data.name=="")
        data.name="Not mentioned";
      if(data.email_id=="")
        error.push("Email id cannot be empty.");
      if(data.mobile_number=="")
        error.push("Mobile number cannot be empty.");
      if(data.random=="")
        data.random=randomstring.generate(6);
      if(data.gender=="")
        data.gender="Not mentioned";
    }
    catch (err)
    {
      console.log("inside validate catch",err);
      error.push(""+err);
    }
    finally
    {
        if(error.length>0)
          return {status:false,error:["error::"+error],response:data};
        
        let validateResponse=await userModel.validateUser(data);

        if(!validateResponse.status)
            return validateResponse;
          
        return {status:true,msg:"User validated successfully",response:data};
    }
}
user.validateLoginDetails=(data)=>{
  const error=[];
  try 
  {
      data.username=data.username||"";
      data.password=data.password||"";
      data.provider=data.provider||"normal";
      data.authToken=data.authToken||"";
      data.idToken=data.idToken||"";
      data.is_google=(data.provider=="com.google");
      data.is_facebook=(data.provider=="com.facebook");
      data.email=data.email||"";
      data.name=data.name||"";
      data.first_name=data.first_name||"Not mentioned";
      data.last_name=data.last_name||"Not mentioned";
      data.photoUrl=data.photoUrl||"Not mentioned";

      if(data.provider=="")
        error.push("Provider cannot be empty.");
      if(data.provider!="normal" && data.provider!="com.google" && data.provider!="com.facebook")
        error.push("Invalid provider");
      if(data.is_facebook && data.authToken=="")
        error.push("Facebook authentication token cannot be empty.");
      if(data.is_google && data.authToken=="")
        error.push("Google authentication token cannot be empty.");
      if(data.is_google && data.idToken=="")
        error.push("Google authentication id cannot be empty.");
      if((data.is_google || data.is_facebook) && data.photoUrl=="")
        error.push("Photo url cannot be empty.");
      if((data.is_google || data.is_facebook) && data.email=="")
        error.push("Email id cannot be empty.");
      if((data.is_google || data.is_facebook) && data.username=="")
        data.username=data.email;
      else if(data.username=="")
        error.push("Username cannot be empty.");
      else if(data.password=="")
        error.push("Password cannot be empty.");

      if((data.is_google||data.is_facebook) && data.name=="")
      {
        data.name="Not mentioned";
      }
  }
  catch (error)
  {
    console.log("Login validation error",error);
    return {status:false,error:["error::"+error],response:{}}
  }
  finally
  {
    if(error.length>0)
      return {status:false,error:["error"+error],response:{}}
    return {status:true,msg:"Login details validated successfully.",response:data};
  }
}
user.validateSocialLogin=(data)=>{
  const error=[];
  try 
  {
      data.provider=data.provider||"";
      data.social_id=data.social_id||"";
      data.email=data.email||"";
      data.name=data.name||"Not mentioned";
      data.photoUrl=data.photoUrl||"http://iic-folow.s3.ap-south-1.amazonaws.com/1595592817902default.png";

      if(data.provider=="")
        error.push("Provider cannot be empty.");
      
      if(data.social_id=="")
        error.push("Social authentication id cannot be empty.");

      if(data.photoUrl=="")
        data.photoUrl="http://iic-folow.s3.ap-south-1.amazonaws.com/1595592817902default.png";

      if(data.email=="")
        error.push("Email id cannot be empty.");

      data.username=data.social_id;
      data.password=data.provider+data.social_id;

      if(data.name=="")
        data.name="Not mentioned";
      
  }
  catch (error)
  {
    console.log("Login validation error",error);
    return {status:false,error:["error::"+error],response:{}}
  }
  finally
  {
    if(error.length>0)
      return {status:false,error:["error"+error],response:{}}
    return {status:true,msg:"Login details validated successfully.",response:{data}};
  }
}
user.createAndValidateModifyObject=(data)=>{
  try 
  {
    const updateObj={};
    
    data.username=data.username=="";
    data.about_me=data.about_me||"";
    data.email=data.email||"";
    data.mobile=data.mobile||"";
    data.gender=data.gender||"";
    data.name=data.name||"";
    
    if(data.username!="")
      updateObj.username=encrypt.encryptWithStringSalt(data.username,process.env.salt_string);
    
    if(data.email!="")
    {
      updateObj.email_id=encrypt.encryptWithStringSalt(data.email,process.env.salt_string);
      updateObj.is_email_verified=false;
    }
    if(data.mobile!="")
    {
      updateObj.mobile_number=data.mobile;
      updateObj.is_mobile_verified=false;
    }
    if(data.gender!="")
      updateObj.gender=data.gender;
    
    if(data.name!="")
      updateObj.person_name=data.name;
    
    if(data.about_me!="")
      updateObj.about_me=data.about_me;
    
    return {status:true,msg:updateObj};
  } catch (error) {
    console.log("update user profile error",error);
    return {status:false,error:["error"+error],response:{}};
  }
}
user.registerUser=async(request,response)=>{
  try 
  {
      let data =request.body;

      console.log("register user data",data);
      
      const validateUser=await user.validateUserRegistration(data);
      
      if(!validateUser.status)
      {
        console.log("Validation error for user registration ",validateUser);
        response.status(200).json(validateUser);
        return;
      }
      data=validateUser.response;
      console.log("files",request.files);
      if(request.files)
      {
        data.profile_image=(request.files.profile_image?request.files.profile_image[0].location:"http://iic-folow.s3.ap-south-1.amazonaws.com/1595592817902default.png");
        data.background_image=(request.files.background_image?request.files.background_image[0].location:"http://iic-folow.s3.ap-south-1.amazonaws.com/1595593359035images.jpg");
      }
      else
      {
        data.profile_image="http://iic-folow.s3.ap-south-1.amazonaws.com/1595592817902default.png";
        data.background_image="http://iic-folow.s3.ap-south-1.amazonaws.com/1595593359035images.jpg";
      }
      let userData={
        username:data.username,
        person_name:data.name,
        email_id:data.email_id,
        mobile_number:data.mobile_number,
        gender:data.gender,
        dob:data.date_of_birth,
        about_me:data.about_me,
        profile_image:data.profile_image,
        background_image:data.background_image,
        password:data.password,
        is_social:false,
        social_id:"N/A",
        last_otp_sent:""+randomnumber({min: 100000,max: 999999,integer: true})
      }
        
      
      const userResponse=await userModel.addUser(userData);

      console.log("User registration response ",userResponse);

      if(userResponse.status)
      {
        const otp_message=`This OTP Valid for 5 minutes....
        Please copy the OTP for email verification....`+userData.last_otp_sent;
        await send_email.sendMail(data.email_id, "Email Verification", otp_message);
      }

      response.status(200).json(userResponse);
  }
  catch (error)
  {
    console.log("registration error",error);
    response.status(200).json({status: false, error: ["Problem occurred in user registration. Please try later"],response:{}});
  }
}
user.loginUser=async(request,response)=>{
  try
  {
      const data=request.body;

      console.log("login object ",data);

      const validateLogin=user.validateLoginDetails(data);

      if(!validateLogin.status)
      {
        console.log("Login validation error ",validateLogin);
          response.status(200).json(validateLogin);
          return;
      }
      const loginResponse=await userModel.login(validateLogin.response);

      console.log("login response ",loginResponse);

      response.status(200).json(loginResponse);
  }
  catch(error)
  {
    console.log("login error",error);
    response.status(200).json({status:false,error:["Problem in validating login details."],response:{}});
  }
}
user.user_verify=async(request,response)=>{
  try 
  {
    console.log("User verification object ",request.body);
      let token="";
      if(request.body.auth_token)
      {
        token=request.body.auth_token;
      }
      if(token=="" && request.body.email_id=="")
      {
        console.log("user detail response","Email id cannot be empty.");
        response.status(200).json({status:false,error:["Email id cannot be empty."],response:{}});
        return;
      }

      
      const verifyUser=await userModel.verifyOtp(request.body,token);

      console.log("User verification response ", verifyUser);
      
      response.status(200).json(verifyUser);
  }
  catch (error)
  {
    console.log("login error",error);
    response.status(200).json({status:false,error:["Problem in user otp verification details."],response:{}});
  }
}
user.user_detail=async(request,response)=>{
  try
  {
    // if(!request.headers.hasOwnProperty("authorization"))
    // {
    //   response.status(200).json({"status":"unsuccess","error":"Api key is not present"});
    //   return;
    // }
    request.body.auth_token=request.body.auth_token||"";
    if(request.body.auth_token=="")
    {
      console.log("user detail response","Auth token cannot be empty.");
      response.status(200).json({status:false,error:["Auth token cannot be empty."]})
      return;
    }
    const token=request.body.auth_token;

    console.log("user details token",token);

    if(token=="")
    {
        response.status(200).json({status:false,error:["Auth token cannot be empty."],response:{}});
        return;
    }

    const userResponse=await userModel.userDetails({token});

    console.log("user details response",userResponse);

    response.status(200).json(userResponse);
  }
  catch (error) 
  {
    console.log("user verification error",error);
    response.status(200).json({status:false,error:["Problem in fetching user details details."],response:{}});
  }
}
user.resend_otp=async(request,response)=>{
  try
  {
    let token="";
    if(request.body.token)
    {
      token=request.body.token;
    }
    console.log("resend otp token ",token);
    console.log("resent otp email ",request.body.email);

    if(token=="" && request.body.email=="")
    {
      console.log("response","Email id cannot be empty")
      response.status(200).json({status:false,error:["Email id cannot be empty."]});
      return;
    }
    const data=request.body;
    data.otp=""+randomnumber({min: 100000,max: 999999,integer: true});

    console.log("Otp input data ",data);

    const otpSendResponse=await userModel.sendOtp(data,token);

    console.log("Otp send response ",otpSendResponse);
    
    if(otpSendResponse.status)
    {
      const otp_message="Your otp  "+data.otp+" for  email verification. Please copy OTP for email verification. This OTP is valid for 5 minutes only.";
      
      await send_email.sendMail(data.email, "Email Verification", otp_message);
    }
    response.status(200).json(otpSendResponse);
  }
  catch (error)
  {
    console.log("user resend otp error",error);
    response.status(200).json({status:false,error:["Problem in sending otp details."],response:{}});
  }
}
user.update_user_profile=async(request,response)=>{
  try 
  {
    
    const token=request.body.auth_token;

    console.log("Modify profile token ",token);

    if(token=="")
    {
      response.status(200).json({status:false,error:["Auth token cannot be empty."],response:response.body});
      return;
    }
    
    const data=user.createAndValidateModifyObject(request.body);

    console.log("Modify profile data ",data);

    if(!data.status)
    {
      response.status(200).json(data);
      return;
    }
    let profile_image="";
    let background_image="";

    console.log("files",request.files);
    if(request.files)
    {
      console.log("Inside files")
      if(request.files.profile_image)
      {
        profile_image=request.files.profile_image[0].location;
      }
      if(request.files.background_image)
        background_image=request.files.background_image[0].location;
    }
    console.log("profile image",profile_image)
    console.log("background image",background_image)
    if(profile_image!="")
      data.msg.profile_image=profile_image;
    if(background_image!="")
      data.msg.background_image=background_image;
    
    const updateResponse=await userModel.updateUserProfile(data.msg,token);

    console.log("Modify profile response ",updateResponse);

    response.status(200).json(updateResponse);
  } catch (error) {
    console.log("update user profile error",error);
    response.status(200).json({status:false,error:["Problem in updating user profile details."],response:{}});
  }
}
user.resetPassword=async(request,response)=>{
  try 
  {
    const data=request.body;

    data.email=data.email||"";
    data.password=data.password||"";
    data.reset_password_otp=data.reset_password_otp||"";

    if(data.email_id=="")
    {
      response.status(200).json({status:false,error:["Email id cannot be empty."]});
      return;
    }
    if(data.password=="")
    {
      response.status(200).json({status:false,error:["Password cannot be empty."]});
      return;
    }
    if(data.reset_password_otp=="")
    {
      response.status(200).json({status:false,error:["Reset password otp cannot be empty."]});
      return;
    }
    data.email=encrypt.encryptWithStringSalt(data.email,process.env.salt_string);
    data.password=encrypt.passwordWithSaltString(data.password,process.env.salt_string);

    const updateResponse=await userModel.resetPassword(data);


    response.status(200).json(updateResponse);
  } catch (error) {
    console.log("reset password error",error);
    response.status(200).json({status:false,error:["Problem in resetting password details."],response:{}});
  }
}
user.user_profiling=async(request,response)=>{
  try 
  {
      const data=request.body;
      data.auth_token=data.auth_token||"";
      data.username=data.username||"";
      data.profile_type=data.profile_type||"people";
      data.hashtag=data.hashtag||"";


      data.name="";
      data.email="";
      data.description="";
      data.location="";
      data.post_date="";
      data.post_utc_date="";
      data.current_user=false;
      data.following=false;

      console.log("User profile data ",data);

      if(data.auth_token=="" && data.username=="")
      {
        console.log("User profiling validation response ",data);
        response.status(200).json({status:false,error:["Either username or auth_token must be required. Both cannot be empty"],response:{}});
        return;
      }

      if(data.profile_type=="people" || data.profile_type=="")
      {
        const profileResponse=await userModel.userProfile(data);
        
        console.log("User profile response::",profileResponse);
        
        response.status(200).json(profileResponse);
      }
      else if(data.profile_type=="hashtag")
      {
        data.username="";
        if(data.hashtag=="")
        {
          response.json({status:false,error:["Hashtag cannot be empty for hashtag profile."],response:{}});
          return;
        }
        if(data.hashtag.indexOf("#")>0 || data.hashtag.indexOf("#")==-1)
            data.hashtag="#"+data.hashtag;
            
        const hashtagProfileResult=await postModel.getAllPosts(data);
        
        console.log("hashtag profile result",hashtagProfileResult);
        
        response.status(200).json(hashtagProfileResult);

      }
      else
      {
        response.json({status:false,error:["Invalid profile type"],response:{}});
      }
      
  }
  catch (error)
  {
    console.log("User profiling error",error);
    response.status(200).json({status:false,error:["Problem in fetching user profile details."],response:{}});
  }
}
user.user_follow=async(request,response)=>{
  try
  {
      const data=request.body;
      data.username=data.username||"";
      data.auth_token=data.auth_token||"";
      const error=[];
      if(data.auth_token=="")
      {
        error.push("Api token cannot be empty.");
      }
      if(data.username=="")
      {
        error.push("Following users username cannot be empty.");
      }
      if(error.length>0)
      {
        console.log("user follow validation error ",error);
        response.status(200).json({status:false,error:error,response:{}});
        return;
      }
      
      const verifyUser=await userModel.verifyUser(data.auth_token);

      if(!verifyUser.status)
      {
        console.log("user follow validation error ",verifyUser);
        response.status(200).json(verifyUser);
        return;
      }
      const followUserResponse=await userModel.followPerson(data);

      console.log("follow user response",followUserResponse);

      response.status(200).json(followUserResponse);
  } catch (error) {
    console.log("User profiling error",error);
    response.status(200).json({status:false,error:["Problem in following user details."],response:{}});
  }
}
user.user_follower_list=async(request,response)=>{
  try 
  {
    const data=request.body;
    data.username=data.username||"";
    data.auth_token=data.auth_token||"";
    const error=[];
    if(data.auth_token=="")
    {
      error.push("Api token cannot be empty.");
    }
    if(error.length>0)
    {
      console.log("user follow validation error ",error);
      response.status(200).json({status:false,error:error,response:{}});
      return;
    }
    
    const verifyUser=await userModel.verifyUser(data.auth_token);

    if(!verifyUser.status)
    {
      console.log("user follow validation error ",verifyUser);
      response.status(200).json(verifyUser);
      return;
    }
    const followUserResponse=await userModel.getFollowerDetails(data);

    console.log("follow user response",followUserResponse);

    response.status(200).json(followUserResponse);
  }
  catch (error)
  {
    console.log("User profiling error",error);
    response.status(200).json({status:false,error:["Problem in following user details."],response:{}});
  }
}
user.user_following_list=async(request,response)=>{
  try 
  {
    const data=request.body;
    data.username=data.username||"";
    data.auth_token=data.auth_token||"";
    const error=[];
    if(data.auth_token=="")
    {
      error.push("Api token cannot be empty.");
    }
    if(error.length>0)
    {
      console.log("user follow validation error ",error);
      response.status(200).json({status:false,error:error,response:{}});
      return;
    }
    
    const verifyUser=await userModel.verifyUser(data.auth_token);

    if(!verifyUser.status)
    {
      console.log("user follow validation error ",verifyUser);
      response.status(200).json(verifyUser);
      return;
    }
    const followUserResponse=await userModel.getFollowingDetails(data);

    console.log("follow user response",followUserResponse);

    response.status(200).json(followUserResponse);
  }
  catch (error)
  {
    console.log("User profiling error",error);
    response.status(200).json({status:false,error:["Problem in following user details."],response:{}});
  }
}
user.profile_search=async(request,response)=>{
  try
  {
    const data=request.body;
    
    data.auth_token=data.auth_token||"";
    data.search=data.search||"";
    data.search_type=data.search_type||"people"
    
    if(data.auth_token!="")
    {
      const verifyUser=await userModel.verifyUser(data.auth_token);

      if(!verifyUser.status)
      {
        console.log("user follow validation error ",verifyUser);
        response.status(200).json(verifyUser);
        return;
      }
    }

    if(data.search=="")
    {
      console.log("Filter paramters empty error.")
      response.status(200).json({status:false,error:["Please provide username or name or email id or mobile number of user."],response:{}});
    }

    if(data.search_type=="people" || data.search_type=="")
    {
      const profileSearchResult=await userModel.profileSearch(data);
      console.log("Profile search result",profileSearchResult);
      response.status(200).json(profileSearchResult);
    }
    else if(data.search_type=="hashtag")
    {
      if(data.search.indexOf("#")>0 || data.search.indexOf("#")==-1)
        data.search="#"+data.search;
      
      const hashtagSearchResult=await userModel.hashTagsSearch(data);
      
      console.log("hashtag search result",hashtagSearchResult);
      
      response.status(200).json(hashtagSearchResult);
    }
    else
    {
      response.json({status:false,error:["Invalid search type"],response:{}});
    }
  }
  catch (error)
  {
    console.log("Exception in profileSearch function::",error);
    return {status:false,error:["Problem in fetching profile details."],response:{}}
  }
}
user.social_login=async(request,response)=>{
  try 
  {
      const data=request.body;
	  console.log("Social login object::",data);
      const validateLogin=await user.validateSocialLogin(data);

      if(!validateLogin.status)
      {
          console.log("Social login validation error:::",validateLogin)
          response.status(200).json(validateLogin);
          return;
      }
      console.log("Validation object",validateLogin);

      const loginResponse=await userModel.social_login(validateLogin.response.data);

      console.log("login response ",loginResponse);

      response.status(200).json(loginResponse);
  }
  catch (error)
  {
    console.log("Exception in social account function::",error);
    response.status(200).json({status:false,error:["Problem in fetching profile details."],response:{}});
  }
}
user.hashtags_search=async(request,response)=>{
  try
  {
    const data=request.body;
    
    data.auth_token=data.auth_token||"";
    data.search=data.search||"";
    
    if(data.auth_token!="")
    {
      const verifyUser=await userModel.verifyUser(data.auth_token);

      if(!verifyUser.status)
      {
        console.log("user follow validation error ",verifyUser);
        response.status(200).json(verifyUser);
        return;
      }
    }

    if(data.search=="")
    {
      console.log("Filter paramters empty error.")
      response.status(200).json({status:false,error:["Please provide username or name or email id or mobile number of user."],response:{}});
    }
    if(data.search.indexOf("#")>0 || data.search.indexOf("#")==-1)
      data.search="#"+data.search;
    const hashtagSearchResult=await userModel.hashTagsSearch(data);

    console.log("hashtag search result",hashtagSearchResult);

    response.status(200).json(hashtagSearchResult);
  }
  catch (error)
  {
    console.log("Exception in hashtagSearch function::",error);
    return {status:false,error:["Problem in fetching hashtag details."],response:{}}
  }
}
user.hashtag_profile=async(request,response)=>{
  
  try
  {
    const data=request.body;
    
    data.auth_token=data.auth_token||"";
    data.search=data.search||"";
    
    if(data.auth_token!="")
    {
      const verifyUser=await userModel.verifyUser(data.auth_token);

      if(!verifyUser.status)
      {
        console.log("user follow validation error ",verifyUser);
        response.status(200).json(verifyUser);
        return;
      }
    }

    if(data.search=="")
    {
      console.log("Filter paramters empty error.")
      response.status(200).json({status:false,error:["Please provide username or name or email id or mobile number of user."],response:{}});
    }
    if(data.search.indexOf("#")>0 || data.search.indexOf("#")==-1)
      data.search="#"+data.search;

    const hashtagSearchResult=await userModel.hashTagProfile(data);

    console.log("hashtag search result",hashtagSearchResult);

    response.status(200).json(hashtagSearchResult);
  }
  catch (error)
  {
    console.log("Exception in hashtagSearch function::",error);
    return {status:false,error:["Problem in fetching hashtag details."],response:{}}
  }

}
module.exports=user;