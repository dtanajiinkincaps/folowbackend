require('dotenv').config();
const crypto=require("crypto");
const mongoose=require("mongoose");
// const dateTime=require("../config/date");
const encrypt = require("../config/encryptdecrypt");
const datetime=require("node-datetime");

datetime.setDefaultFormat('Y-m-d H:M:S');
const userSchama=new mongoose.Schema({
    "username":{type:String,require:true},
    "name":{type:String,require:true},
    "email_id":{type:String,require:true},
    "mobile_number":{type:String,require:true},
    "gender":{type:String,require:true},
    "dob":{type:String,default:datetime.create().format()},
    "about_me":{type:String,default:"Not mentioned"},
    "profile_image":{type:String,default:"Not mentioned"},
    "background_image":{type:String,default:"Not mentioned"},
    "password":{type:String,require:true},
    "random" : {type:String,require:true},
    "is_email_verified" : {type:Boolean,default:false},
    "is_mobile_verified" : {type:Boolean,default:false},
    "last_otp_sent":{type:String,default:"N/A"},
    "otp_sent_time":{type:String,default:datetime.create().format()},
    "create_at" : {type:String,default:datetime.create().format()},
    "is_facebook":{type:Boolean,default:false},
    // "facebook_photoUrl":{type:String,default:"N/A"},
    "facebook_authToken":{type:String,default:"N/A"},
    // "facebook_provider":{type:String,default:"N/A"},
    "is_google":{type:Boolean,default:false},
    // "google_photoUrl":{type:String,default:"N/A"},
    "google_authToken":{type:String,default:"N/A"},
    "google_authId":{type:String,default:"N/A"},
    // "google_provider":{type:String,default:"N/A"},
    "auth_token" : {type:String,default:"N/A"},
    "followers":{type:String,default:"0"},
    "following":{type:String,default:"0"},
    "deleted":{type:Boolean,default:false},
    "permenant_delete_time":{type:String,default:datetime.create().format()},
    
});
userSchama.pre("save",async function(next){
    try
    {
        const user=this;
        
        const salt=crypto.randomBytes(16);
        user.username=encrypt.encryptWithStringSalt(user.username,process.env.salt_string);
        user.name=encrypt.encryptWithStringSalt(user.name,process.env.salt_string);
        user.email_id=encrypt.encryptWithStringSalt(user.email_id,process.env.salt_string);
        user.mobile_number=encrypt.encryptWithStringSalt(user.mobile_number,process.env.salt_string);
        user.gender=encrypt.encryptWithStringSalt(user.gender,process.env.salt_string);
        // user.dob=encrypt.encryptWithStringSalt(user.dob,process.env.salt_string);
        user.about_me=encrypt.encryptWithStringSalt(user.about_me,process.env.salt_string);
        user.password=encrypt.passwordWithSaltString(user.password,process.env.salt_string);
        user.last_otp_sent=encrypt.encryptWithStringSalt(user.last_otp_sent,process.env.salt_string);
        
        user.create_at=encrypt.encryptWithStringSalt(user.create_at,process.env.salt_string);
        user.profile_image=encrypt.encryptWithStringSalt(user.profile_image,process.env.salt_string);
        user.background_image=encrypt.encryptWithStringSalt(user.background_image,process.env.salt_string);
        user.facebook_authToken=encrypt.encryptWithStringSalt(user.facebook_authToken,process.env.salt_string);
        
        
        user.google_authToken=encrypt.encryptWithStringSalt(user.google_authToken,process.env.salt_string);
        user.google_authId=encrypt.encryptWithStringSalt(user.google_authId,process.env.salt_string);
        const token=await encrypt.generateToken({"username":user.username,"email_id":user.email_id});
        user.auth_token=token.msg

        next();
    }
    catch(error)
    {
        console.log("User Schema pre function error",error);
        throw new Error(error);
    }
});
userSchama.post("find",function(result){
    try
    {
        // console.log("find",result);
        for(let i=0;i<result.length;i++)
        {
            result[i].username=encrypt.decrypt(result[i].name,process.env.salt_string);
            result[i].name=encrypt.decrypt(result[i].name,process.env.salt_string);
            result[i].email_id=encrypt.decrypt(result[i].email_id,process.env.salt_string);
            result[i].mobile_number=encrypt.decrypt(result[i].mobile_number,process.env.salt_string);
            result[i].gender=encrypt.decrypt(result[i].gender,process.env.salt_string);
            // result[i].dob=encrypt.decrypt(result[i].dob,process.env.salt_string);
            result[i].about_me=encrypt.decrypt(result[i].about_me,process.env.salt_string);
            result[i].create_at=encrypt.decrypt(result[i].create_at,process.env.salt_string);
            result[i].facebook_authToken=encrypt.decrypt(result[i].facebook_authToken,process.env.salt_string);
            result[i].google_authToken=encrypt.decrypt(result[i].google_authToken,process.env.salt_string);
            result[i].google_authId=encrypt.decrypt(result[i].google_authId,process.env.salt_string);
            result[i].profile_image=encrypt.decrypt(result[i].profile_image,process.env.salt_string);
            result[i].background_image=encrypt.decrypt(result[i].background_image,process.env.salt_string);
        }
    }
    catch(error)
    {
        console.log("userSchema.post function error",error);
        throw new Error(error);
    }
});
userSchama.post("findOne",function(result){
    try
    {
        
            result.username=encrypt.decrypt(result.username,process.env.salt_string);
            result.name=encrypt.decrypt(result.name,process.env.salt_string);
            result.email_id=encrypt.decrypt(result.email_id,process.env.salt_string);
            result.mobile_number=encrypt.decrypt(result.mobile_number,process.env.salt_string);
            result.gender=encrypt.decrypt(result.gender,process.env.salt_string);
            // result.dob=encrypt.decrypt(result.dob,process.env.salt_string);
            result.about_me=encrypt.decrypt(result.about_me,process.env.salt_string);
            result.create_at=encrypt.decrypt(result.create_at,process.env.salt_string);
            result.last_otp_sent=encrypt.decrypt(result.last_otp_sent,process.env.salt_string);
            
            
            result.facebook_authToken=encrypt.decrypt(result.facebook_authToken,process.env.salt_string);
            
            
            result.google_authToken=encrypt.decrypt(result.google_authToken,process.env.salt_string);
            result.google_authId=encrypt.decrypt(result.google_authId,process.env.salt_string);
            result.profile_image=encrypt.decrypt(result.profile_image,process.env.salt_string);
            result.background_image=encrypt.decrypt(result.background_image,process.env.salt_string);
    }
    catch(error)
    {
        console.log("userSchema.post function error",error);
        throw new Error(error);
    }
});

const userModel=new mongoose.model("users",userSchama);

const userdb={};

userdb.addUser=(data)=>{
    try
    {
        const userAddResult=userModel(data).save();
        return userAddResult.then((response)=>{
            return {status:true,msg:"User registered successfully.",response:{token:response.auth_token}};
        });
    }
    catch (error)
    {
        console.log("add user error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.validateUser=async (data)=>
{
    try 
    {
        
        const errMsg=[];

        
        const checkUsername=await userdb.checkUsernameAvailabilty(data);

        if(!checkUsername.status)
            errMsg.push(checkUsername.error);
        
        const checkEmail=await userdb.checkEmailAvailabilty(data);

        if(!checkEmail.status)
            errMsg.push(checkEmail.error);
        
        const checkMobile=await userdb.checkMobileNoAvailabilty(data);

        console.log(checkMobile);

        if(!checkMobile.status)
            errMsg.push(checkMobile.error);

        if(errMsg.length>0)
            return {status:false,error:errMsg,response:{}};

        return {status:true,msg:"User validated successfully.",response:data};

    }
    catch (error)
    {
        console.log("validateUser function error",error);
        return  {status: false, error: "error:"+error, response:{}};
    }
}
userdb.checkUsernameAvailabilty=(data)=>{
    try
    {
        
        const userNameResponse=userModel.find({"username":encrypt.encryptWithStringSalt(data.username,process.env.salt_string)});

        return userNameResponse.then((result)=>{
            if(result.length>0)
                return {status:false,error:"Username already exists.",response:{}};
            return {status:true,msg:"Username available.",response:{username:data.username}};
        });

    } catch (error)
    {
        console.log("checkUsernameAvailabilty function error",error);
        return  {status: false, error: "error:"+error };       
    }
}
userdb.checkEmailAvailabilty=(data)=>{
    try
    {
        const emailIdResponse=userModel.find({"email_id":encrypt.encryptWithStringSalt(data.email_id,process.env.salt_string)});

        return emailIdResponse.then((result)=>{
            if(result.length>0)
                return {status:false,error:"Email id already exists.",response:{}};
            return {status:true,msg:"Email id not used.",response:{email_id:data.email_id}};
        });

    } catch (error)
    {
        console.log("checkEmailAvailabilty function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.checkMobileNoAvailabilty=(data)=>{
    try
    {
        const mobileNoResponse=userModel.find({"mobile_number":encrypt.encryptWithStringSalt(data.mobile_number,process.env.salt_string)});

        return mobileNoResponse.then((result)=>{
            if(result.length>0)
                return {status:false,error:"Mobile number already exists.",response:{}};
            
            return {status:true,msg:"Mobile number not used.",response:data.mobile_number};
        });
    } catch (error)
    {
        console.log("checkMobileNoAvailabilty function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.login=(data)=>{
    try
    {
        let loginResponse="";
        if(data.is_google)
        {
            loginResponse=userModel.find({google_authToken:data.google_authToken,google_authId:data.google_authId});
        }
        else if(data.is_facebook)
        {
            loginResponse=userModel.find({facebook_authToken:data.facebook_authToken});
        }
        else
        {
            loginResponse=userModel.find({$or:[{"username":encrypt.encryptWithStringSalt(data.username,process.env.salt_string)},{"email_id":encrypt.encryptWithStringSalt(data.username,process.env.salt_string)},{"mobile_number":encrypt.encryptWithStringSalt(data.username,process.env.salt_string)}],password:encrypt.passwordWithSaltString(data.password,process.env.salt_string)});
        }
        return loginResponse.then((result)=>{
            if(result.length==0)
                return {status:false,error:"Invalid username or password.",response:{}};

            return {status:true,success:"Login successfully done.",response:{token:result[0].auth_token}};
        });

    } catch (error)
    {
        console.log("login function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.userProfile=(data)=>{
    try
    {
        const userProfileResponse=userModel.find({auth_token:data.token},{deleted:0,permenant_delete_time:0});
        
        return userProfileResponse.then((result)=>{
            if(result.length==0)
                return  {status: false, error: "User details not found." };
            return {
                    status: true, success: "User profile fetched successfully.",
                    response: { userProfile: result}
                  }
        });

    } catch (error)
    {
        console.log("userprofile function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.verifyOtp=(data,token)=>{
    try 
    {
        let response="";
        if(token)
            response=userModel.findOne({auth_token:token});
        else
            response=userModel.findOne({email_id:encrypt.encryptWithStringSalt(data.email_id,process.env.salt_string)});
        
        return response.then(async(result)=>{
            try
            {
                if(!result && token)
                    return {status:false,error:"Api key is not vaild."};
                if(!result)
                    return {status:false,error:"Wrong email id provided."};

                const currentTime=datetime.create();
                
                const otp_sent_time=datetime.create(result.otp_sent_time);

                const otp_time=(currentTime.getTime()-otp_sent_time.getTime())/60000;

                if(otp_time>5)
                    return {status:false,error:"Otp is expired."};
            
                if(data.otp!=result.last_otp_sent)
                    return {status:false,msg:"Wrong otp entered."};
                
                let updateResponse=await userModel.updateOne({auth_token:result.auth_token},{$set:{is_email_verified:true}});

                return {status:true,msg:"Otp verified succesfully"};
            }
            catch(error)
            {
                console.log("verifyotp inner function error",error);
                return  {status: false, error: "error:"+error };
            }
            
        });
    }
    catch (error) 
    {
        console.log("verifyotp function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.sendOtp=(data,token)=>{
    try 
    {
        let response="";
        if(token)
            response=userModel.findOne({auth_token:token});
        else
            response=userModel.findOne({email_id:encrypt.encryptWithStringSalt(data.email_id,process.env.salt_string)});
        
        return response.then(async(result)=>{
            try
            {
                if(!result && token)
                    return {status:false,error:"Api key is not vaild."};
                if(!result)
                    return {status:false,error:"Wrong email id provided."}
                
                let otp_sent_time=datetime.create().format();
                let updateResponse=await userModel.updateOne({auth_token:result.auth_token},{$set:{is_email_verified:false,last_otp_sent:encrypt.encryptWithStringSalt(data.otp,process.env.salt_string),otp_sent_time:otp_sent_time}});

                console.log(updateResponse);

                return {status:true,msg:"Otp sent succesfully",response:{otp:data.otp,otp_sent_time}};
            }
            catch(error)
            {
                console.log("verifyotp inner function error",error);
                return  {status: false, error: "error:"+error };
            }
            
        });
    }
    catch (error) 
    {
        console.log("verifyotp function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.updateUserProfile=(data,token)=>{
    try
    {
        const response=userModel.findOne({auth_token:token});
        return response.then(async(result)=>{
            try 
            {
                if(!result)    
                    return {status:false,error:"User details not found. Wrong api key provided."};

                let newtoken=token;
                
                if(data.hasOwnProperty("username") && data.hasOwnProperty("email_id"))
                {
                    newtoken=await encrypt.generateToken({"username":data.username,"email_id":data.email_id});
                    newtoken=newtoken.msg;
                    data.auth_token=newtoken;
                }
                else if(data.hasOwnProperty("username"))
                {
                    let email_id=encrypt.encryptWithStringSalt(result.email_id,process.env.salt_string);

                    newtoken=await encrypt.generateToken({"username":data.username,"email_id":email_id});

                    newtoken=newtoken.msg;
                    data.auth_token=newtoken;
                }
                else if(data.hasOwnProperty("email_id"))
                {
                    let username=encrypt.encryptWithStringSalt(result.username,process.env.salt_string);

                    newtoken=await encrypt.generateToken({"username":username,"email_id":data.email_id});

                    newtoken=newtoken.msg;
                    data.auth_token=newtoken;
                }

                const updateResponse=userModel.updateOne({"token":token},{$set:data});

                // console.log(updateResponse);

                return {status:true,msg:"User profile updated successfully.",token:newtoken};
            }
            catch (error)
            {
                console.log("updateUserProfile inner function error",error);
                return  {status: false, error: "error:"+error };
            }
        })
    }
    catch (error)
    {
        console.log("updateUserProfile function error",error);
        return  {status: false, error: "error:"+error };
    }
}
userdb.resetPassword=(data)=>{
    try
    {
        const resetResponse=userModel.findOne({email_id:data.email_id});

        return resetResponse.then((result)=>{
            try
            {
                if(!result)
                    return {status:false,error:"Wrong email id provided"};

                const updateResponse=userModel.updateOne({email_id:data.email_id},{$set:{"password":data.password}});

                console.log(updateResponse);

                return {status:true,msg:"Password updated successfully."};
            }
            catch (error)
            {
                console.log("reset password inner function error",error);
                return  {status: false, error: "error:"+error };
            }
        })
    }
    catch (error)
    {
        console.log("reset password function error",error);
        return  {status: false, error: "error:"+error }
    }
}
module.exports=userdb;