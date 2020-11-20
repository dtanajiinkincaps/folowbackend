require('dotenv').config();
const encrypt = require("../config/encryptdecrypt");
const db=require("../config/db-postgres-connection.config");
const moment=require("moment-timezone");
const datetime=require("node-datetime");

const userdb={};

userdb.addUser=async(data)=>{
    try
    {
        console.log("model recevied data",data);
        let user=data;

        user.username=encrypt.encryptWithStringSalt(user.username,process.env.salt_string);
        user.email_id=encrypt.encryptWithStringSalt(user.email_id,process.env.salt_string);
        // user.mobile_number=encrypt.encryptWithStringSalt(user.mobile_number,process.env.salt_string);
        user.password=encrypt.passwordWithSaltString(user.password,process.env.salt_string);
        
        user.social_id=encrypt.encryptWithStringSalt(user.social_id,process.env.salt_string);

        const token=await encrypt.generateToken({"username":user.username,"email_id":user.email_id});

        if(!token.status)
            return token;

        user.auth_token=token.msg;
        
        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:mm:ss');
        console.log(indian_time);
        if(user.dob=="")
            user.dob=indian_time;
        user.create_at=indian_time;
        user.otp_sent_time=indian_time;
        user.permenant_delete_time=indian_time;

        const response = await db.insertRecords(user,"users");

        console.log("model response",response);

        if(!response.status)
            return response;
        else
            return {status:true,success:"User registered successfully.",response:{auth_token:user.auth_token}};
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
        
        // const checkMobile=await userdb.checkMobileNoAvailabilty(data);

        // if(!checkMobile.status)
        //     errMsg.push(checkMobile.error);

        if(errMsg.length>0)
            return {status:false,error:errMsg,response:{}};

        return {status:true,success:"User validated successfully.",response:{user:data}};

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
        // console.log("username",data.username);
        const sql="select * from users where username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"'";
        const userNameResponse=db.fetchRecords(sql);
        return userNameResponse.then((result)=>{
            if(!result.status)
            {
                return result;
            }
            else if(result.msg.length>0)
                return {status:false,error:"Username already exists.",response:{}};
            else
                return {status:true,success:"Username available.",response:{user:data}};
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
        // console.log("username",data.email_id);
        const sql="select * from users where email_id='"+encrypt.encryptWithStringSalt(data.email_id||data.email,process.env.salt_string)+"'";
        const emailIdResponse=db.fetchRecords(sql);

        return emailIdResponse.then((result)=>{
            if(!result.status)
            {
                return result;
            }
            else if(result.msg.length>0)
                return {status:false,error:"Email id already exists.",response:{}};
            else
                return {status:true,success:"Email id available.",response:{username:data.email_id||data.email}};
        });

    } catch (error)
    {
        console.log("checkEmailAvailabilty function error",error);
        return  {status: false, error: "error:"+error };
    }
}
// userdb.checkMobileNoAvailabilty=(data)=>{
//     try
//     {
//         const sql="select * from users where mobile_number='"+encrypt.encryptWithStringSalt(data.mobile_number,process.env.salt_string)+"'";

//         const mobileNoResponse=db.fetchRecords(sql);

//         return mobileNoResponse.then((result)=>{
//             if(!result.status)
//             {
//                 return result;
//             }
//             else if(result.msg.length>0)
//                 return {status:false,error:"Mobile number already exists.",response:{}};
//             else
//                 return {status:true,success:"Mobile number available.",response:{username:data.username}};
//         });
//     } catch (error)
//     {
//         console.log("checkMobileNoAvailabilty function error",error);
//         return  {status: false, error: "error:"+error };
//     }
// }
userdb.login=async(data)=>{
    try
    {
        
        let loginQuery="Select * from users where 1=1";
        loginQuery+=" and (username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"' or email_id='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"') and password='"+encrypt.passwordWithSaltString(data.password,process.env.salt_string)+"'";
        
        const loginResponse=db.fetchRecords(loginQuery);


        return loginResponse.then(async(result)=>{
            if(!result.status)
                return {status:false,error:["Problem in checking login details. Please try again."]};
            else if(result.msg.length==0)
                return {status:false,error:["Invalid login. Please provide valid login credentials"],response:{user:{}}};
            
            return {status:true,success:"Login successfully done.",response:{auth_token:result.msg[0].auth_token}};
        });

    } catch (error)
    {
        console.log("login function error",error);
        return  {status: false, error: ["error:"+error], response:{} };
    }
}
userdb.userDetails=(data)=>{
    try
    {
        let updateProfileQuery="SELECT username, email_id, person_name as name, mobile_number, gender, about_me, dob, profile_image, background_image, is_email_verified, is_mobile_verified, last_otp_sent, otp_sent_time, create_at,is_social,social_id, followers, following, permenant_delete_time, is_deleted FROM users where 1=1 ";
        
        if(data.token!="")
            updateProfileQuery+=" and auth_token='"+data.token+"'";
        else
            return {status:false,error:['Auth token cannot be empty.'],response:{}};
        
        const userProfileResponse=db.fetchRecords(updateProfileQuery);
        
        return userProfileResponse.then((result)=>{
            if(!result.status)
                return result
            if(result.msg.length==0)
                return  {status: false, error: ["User details not found."] };

            result=result.msg[0];
            result.username=encrypt.decrypt(result.username,process.env.salt_string);
            result.email_id=encrypt.decrypt(result.email_id,process.env.salt_string);
            result.social_id=encrypt.decrypt(result.social_id,process.env.salt_string);
            
            const m_today = moment(result.otp_sent_time);
            result.otp_sent_time = m_today.tz('Asia/kolkata').format('DD/MM/YYYY hh:mm:ss a');
            const create_at=moment(Date.parse(result.create_at));
            result.create_at=create_at.tz('Asia/kolkata').format('DD/MM/YYYY hh:mm:ss a');
            const dob = moment(result.dob);
            result.dob= dob.tz('Asia/kolkata').format('DD/MM/YYYY hh:mm:ss a');
            const deleteTime=moment(result.permenant_delete_time);
            result.permenant_delete_time=deleteTime.tz("Asia/kolkata").format("DD/MM/YYYY hh:mm:ss a");
            
            return {
                    status: true, success: "User details fetched successfully.",
                    response: { profile_details: result}
                  }
        });

    } catch (error)
    {
        console.log("userdetails function error",error);
        return  {status: false, error: ["error:"+error] };
    }
}
userdb.verifyOtp=(data,token)=>{
    try 
    {
        let verifyQuery="select * from users where 1=1 ";
        if(token)
            verifyQuery+="and auth_token='"+token+"'";
        else
            verifyQuery+="and email_id='"+encrypt.encryptWithStringSalt(data.email,process.env.salt_string)+"'";

        const response=db.fetchRecords(verifyQuery);
        
        return response.then(async(result)=>{
            try
            {
                if(!result.status && token)
                    return {status:false,error:["Api key is not vaild."]};
                if(!result.status)
                    return {status:false,error:["Wrong email id provided."]};

                const currentTime=datetime.create();
                
                const otp_sent_time=datetime.create(result.msg[0].otp_sent_time);

                const otp_time=(currentTime.getTime()-otp_sent_time.getTime())/60000;

                // console.log(otp_time);

                if(otp_time>5)
                    return {status:false,error:["Otp is expired."]};
            
                if(data.register_otp!=result.msg[0].last_otp_sent)
                    return {status:false,error:["Wrong otp entered."]};
                
                const condition=" auth_token='"+result.msg[0].auth_token+"'";
                const updatedata={
                    is_email_verified:true
                }
                
                let updateResponse=await db.updateRecords(updatedata,"users",condition);

                if(!updateResponse.status)
                    return updateResponse;

                return {status:true,success:"Otp verified succesfully",response:{}};
            }
            catch(error)
            {
                console.log("verifyotp inner function error",error);
                return  {status: false, error: ["error:"+error] };
            }
            
        });
    }
    catch (error) 
    {
        console.log("verifyotp function error",error);
        return  {status: false, error: ["error:"+error] };
    }
}
userdb.sendOtp=(data,token)=>{
    try 
    {
        let verifyQuery="select * from users where 1=1 ";
        if(token)
            verifyQuery+="and auth_token='"+token+"'";
        else
            verifyQuery+="and email_id='"+encrypt.encryptWithStringSalt(data.email,process.env.salt_string)+"'";

        const response=db.fetchRecords(verifyQuery);
        
        return response.then(async(result)=>{
            try
            {
                console.log(result);
                if(!result.status && token)
                    return {status:false,error:["Api key is not vaild."]};
                else if(!result.status)
                    return {status:false,error:["Wrong email id provided."]}
                else if(result.msg.length==0)
                    return {status:false,error:["Email id not registered."]};
                
                const today = new Date();
                const m_today = moment(today);
                const otp_sent_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:mm:ss');

                const updatedata={
                    is_email_verified:false,
                    last_otp_sent:data.otp,
                    otp_sent_time:otp_sent_time
                };

                const condition=" auth_token='"+result.msg[0].auth_token+"'";
                let updateResponse=await db.updateRecords(updatedata,"users",condition);

                console.log(updateResponse);

                if(!updateResponse.status)
                    return updateResponse;

                return {status:true,success:"Otp sent succesfully",response:{user:{otp:data.otp,otp_sent_time}}};
            }
            catch(error)
            {
                console.log("sendotp inner function error",error);
                return  {status: false, error: ["error:"+error],response:{} };
            }
        });
    }
    catch (error) 
    {
        console.log("sendotp function error",error);
        return  {status: false, error: ["error:"+error],response:{} };
    }
}
userdb.updateUserProfile=(data,token)=>{
    try
    {
        console.log("update profile data",data);
        const updateSelectQuery="select * from users where 1=1 and auth_token='"+token+"'";
        const response=db.fetchRecords(updateSelectQuery);
        return response.then(async(result)=>{
            try 
            {
                if(!result.status)    
                    return result;
                if(result.msg.length==0)
                    return {status:false,error:["User details not found. Wrong api key provided."]};

                let newtoken=token;
                
                if(data.hasOwnProperty("username") && data.hasOwnProperty("email_id") && data.username!=result.msg[0].username && data.email_id!=result.msg[0].email_id && !data.is_social)
                {
                    let checkUser=await userdb.checkUsernameAvailabilty(data);

                    let updateError=[];
                    if(!checkUser.status )
                        updateError.push(checkUser.error);

                    let checkEmail=await userdb.checkEmailAvailabilty(data);
                    if(!checkEmail)
                        updateError.push(checkEmail.error);

                    if(updateError.length>0)
                        return {status:false,error:updateError,response:{}};
                    
                    newtoken=await encrypt.generateToken({"username":data.username,"email_id":data.email_id});
                    newtoken=newtoken.msg;
                    data.auth_token=newtoken;
                }
                else if(data.hasOwnProperty("username") && data.username!=result.msg[0].username)
                {
                    let checkUser=await userdb.checkUsernameAvailabilty(data);

                    let updateError=[];
                    if(!checkUser.status)
                        updateError.push(checkUser.error);

                    if(updateError.length>0)
                        return {status:false,error:updateError,response:{}};
                    
                    let email_id=encrypt.encryptWithStringSalt(result.msg[0].email_id,process.env.salt_string);

                    newtoken=await encrypt.generateToken({"username":data.username,"email_id":email_id});

                    newtoken=newtoken.msg;
                    data.auth_token=newtoken;
                }
                else if(data.hasOwnProperty("email_id") && data.email_id!=result.msg[0].email_id && !data.is_social)
                {
                    let checkEmail=await userdb.checkEmailAvailabilty(data);
                    if(!checkEmail)
                        updateError.push(checkEmail.error);

                    if(updateError.length>0)
                        return {status:false,error:updateError,response:{}};

                    let username=encrypt.encryptWithStringSalt(result.msg[0].username,process.env.salt_string);

                    newtoken=await encrypt.generateToken({"username":username,"email_id":data.email_id});

                    newtoken=newtoken.msg;
                    data.auth_token=newtoken;
                }
                else if(data.hasOwnProperty("email_id") && data.email_id!=result.msg[0].email_id && data.is_social)
                {
                    return {status:false,error:["Email id cannot be updated for social logins"],response:{}}
                }
                const condition="auth_token='"+token+"'";
                const updateResponse=await db.updateRecords(data,"users",condition);

                console.log(updateResponse);

                if(!updateResponse.status)
                    return updateResponse;

                // if(token!=newtoken)
                // {
                //     const postCondition="auth_token='"+token+"'";
                //     const update={
                //         auth_token:newtoken
                //     }
                //     const postResponse=await db.updateRecords(update,"posts",postCondition);
                //     if(!postResponse.status)
                //         return postResponse;

                //     const likeResponse=await db.updateRecords(update,"post_likes",postCondition);
                //     if(!likeResponse.status)
                //         return likeResponse;

                //     const commentResponse=await db.updateRecords(update,"post_comments",postCondition);
                //     if(!commentResponse.status)
                //         return commentResponse;
                // }

                return {status:true,success:"User profile updated successfully.",response:{auth_token:newtoken}};
            }
            catch (error)
            {
                console.log("updateUserProfile inner function error",error);
                return  {status: false, error: ["error:"+error] ,response:{}};
            }
        })
    }
    catch (error)
    {
        console.log("updateUserProfile function error",error);
        return  {status: false, error: ["error:"+error] };
    }
}
userdb.resetPassword=(data)=>{
    try
    {
        const resetQuery="select * from users where email_id='"+data.email+"'";
        const resetResponse=db.fetchRecords(resetQuery);

        return resetResponse.then(async(result)=>{
            try
            {
                console.log(result);
                if(!result.status)
                    return result;
                if(result.msg.length==0)
                    return {status:false,error:"Wrong email id provided"};

                const currentTime=datetime.create();
                
                const otp_sent_time=datetime.create(result.msg[0].otp_sent_time);
    
                const otp_time=(currentTime.getTime()-otp_sent_time.getTime())/60000;

                if(otp_time>5)
                    return {status:false,error:"Otp is expired."};
            
                if(data.reset_password_otp!=result.msg[0].last_otp_sent)
                    return {status:false,success:"Wrong otp entered."};
                
                const condition=" auth_token='"+result.msg[0].auth_token+"'";
                const updatedata={
                    password:data.password,
                    is_email_verified:true
                }
                
                let updateResponse=await db.updateRecords(updatedata,"users",condition);

                console.log(updateResponse);

                if(!updateResponse.status)
                    return updateResponse;

                return {status:true,success:"Password updated successfully."};
            }
            catch (error)
            {
                console.log("reset password inner function error",error);
                return  {status: false, error: ["error:"+error],response:{} };
            }
        })
    }
    catch (error)
    {
        console.log("reset password function error",error);
        return  {status: false, error: ["error:"+error] }
    }
}
userdb.verifyUser=(token)=>{
    try
    {
        const verifyUserQuery="select * from users where auth_token='"+token+"'";
        const verifyUserResponse=db.fetchRecords(verifyUserQuery);

        return verifyUserResponse.then(async(result)=>{
            try
            {
                if(!result.status)
                    return result;
                if(result.msg.length==0)
                    return {status:false,error:["Wrong user details provided."],response:{}};

                return {status:true,success:"User verified successfully.",response:result.msg[0]};
            }
            catch (error)
            {
                console.log("reset password inner function error",error);
                return  {status: false, error: ["error:"+error] ,response:{}};
            }
        })
    }
    catch (error)
    {
        console.log("reset password function error",error);
        return  {status: false, error: ["error:"+error] ,response:{}}
    } 
}
userdb.userProfile=async(data)=>{
    try 
    {
        let profileQuery="select username,email_id,profile_image,background_image,mobile_number,gender,about_me,person_name as name,followers,following, about_me user_info,auth_token from users where 1=1 ";
        if(data.username!="")
            profileQuery+="and username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"'";
        else if(data.auth_token!="")
            profileQuery+="and auth_token='"+data.auth_token+"'";
        else
            return {status:false,error:["For profile details you need to provide username or auth token."],response:{}};

        console.log("Profile query ",data.username);

        let profileResponse=await db.fetchRecords(profileQuery);

        console.log(profileResponse);

        if(!profileResponse.status)
            return {status:false,error:["Problem in fetching post details."]};

        if(profileResponse.msg.length==0)
            return {status:false,error:["Wrong user details not found."]}

        profileResponse=profileResponse.msg[0];


        console.log("profile details",profileResponse);

        
        let postQuery="select post.post_id,post.description,post.location,post.post_type as type,post.post_timing timing,post.post_utc_timing utc_timing,post.media from posts post,users u where post.auth_token=u.auth_token and u.auth_token='"+profileResponse.auth_token+"'";

        const postResponse=await db.fetchRecords(postQuery);

        if(!postResponse.status)
            return {status:false,error:["Problem in fetching post details."],response:{}};

        let follow=false;

        if(profileResponse.auth_token!=data.auth_token)
        {
            let checkFollower="select * from followers where follower_auth_token='"+data.auth_token+"' and following_auth_token='"+profileResponse.auth_token+"'";
            
            checkFollower=await db.fetchRecords(checkFollower);
            if(!checkFollower.status)
                return checkFollower;

            console.log("follow data",checkFollower);

            console.log("check follow length result",checkFollower.msg.length>0)

            follow=(checkFollower.msg.length>0);
        }
        
        return {
            status:true,
            success:"User profile fetched successfully.",
            response:
            {
                profile_details:
                {
                    username:encrypt.decrypt(profileResponse.username,process.env.salt_string),email_id:encrypt.decrypt(profileResponse.email_id,process.env.salt_string),
                    mobile_number:profileResponse.mobile_number,
                    gender:profileResponse.gender,
                    name:profileResponse.name,
                    profile_image:profileResponse.profile_image,
                    background_image:profileResponse.background_image,
                    about_me:profileResponse.about_me,
                    followers:profileResponse.followers,
                    following:profileResponse.following,
                    user_info:profileResponse.user_info,
                    posts:postResponse.msg.length,
                    post_media:postResponse.msg,
                    follow:follow
                }
            }
        }
    } catch (error) {
        console.log("user profile function error",error);
        return  {status: false, error: ["error:"+error], response:{} };
    }
}
userdb.followPerson=async(data)=>{
    try
    {
        if(data.auth_token=="")    
            return {status:false,error:["Auth token cannot be empty."],response:{}};

        if(data.username=="")
            return {status:false,error:["Following persons username cannot be empty."],response:{}};

        const checkUsernameQuery="select auth_token from users where username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"'";

        let checkUsername=await db.fetchRecords(checkUsernameQuery);

        if(!checkUsername.status)
            return checkUsername;

        if(checkUsername.msg.length==0)
            return {status:false,error:["Wrong username provided."],response:{}};
        
        checkUsername=checkUsername.msg[0];

        if(checkUsername.auth_token==data.auth_token)
            return {status:false,error:["User cannot follow himself/herself."],response:{}};

        let checkFollower="select * from followers where follower_auth_token='"+data.auth_token+"' and following_auth_token='"+checkUsername.auth_token+"'";

        checkFollower=await db.fetchRecords(checkFollower);

        if(!checkFollower.status)
            return checkFollower;

        if(checkFollower.msg.length>0)
            return {status:false,error:["Already followed to given user."],response:{}};

        const today = new Date();
        const m_today = moment(today);
        const indian_time = m_today.tz('Asia/kolkata').format('YYYY/MM/DD HH:mm:ss');
        const utc_time = moment.utc().format('YYYY/MM/DD  HH:mm:ss');

        const folowObject={
            follower_auth_token:data.auth_token,
            following_auth_token:checkUsername.auth_token,
            following_indian_time:indian_time,
            following_utc_time:utc_time
        }
        const newFollow=await db.insertRecords(folowObject,"followers");

        if(!newFollow.status)
            return newFollow;
        
        const followUpdate = await db.updateRecords({followers:"followers+1"},"users","auth_token='"+checkUsername.auth_token+"'");
        
        if(!followUpdate.status)
            return followUpdate;

        const followingUpdate = await db.updateRecords({following:"following+1"},"users","auth_token='"+data.auth_token+"'");
        
        if(!followingUpdate.status)
            return followUpdate;

        return {status:true,success:"User followed successfully.",response:{}};
    }
    catch (error)
    {
        console.log("Exception in followPerson function::",error);
        return {status:false,error:["Problem in following user"],response:{}}
    }
}
userdb.getFollowerDetails=async(data)=>{
    try
    {
        let followersQuery="select u.username,u.person_name as name, u.profile_image from followers follow, users u where follow.follower_auth_token=u.auth_token ";

        let condition=" and 1=1";

        if(data.username!="")
            condition+=" and follow.following_auth_token=(select auth_token from users where username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"')";
        else if(data.auth_token!="")
            condition+=" and follow.following_auth_token='"+data.auth_token+"'";
        else
            return {status:false,error:["Both username and auth token cannot be empty."],response:{}};
        followersQuery+=condition;

        let followersResult= await db.fetchRecords(followersQuery);

        if(!followersResult.status)
            return followersResult;

        if(followersResult.msg.length==0)
            return {status:false,error:["User followers not found."],response:{}}

        followersResult=followersResult.msg;

        for(let i=0;i<followersResult.length;i++)
        {
            followersResult[i].username=encrypt.decrypt(followersResult[i].username,process.env.salt_string);
        }
        return {status:true,success:"User followers fetched successfully.",response:{follower_details:followersResult}};
    }
    catch (error)
    {
        console.log("Exception in followPerson function::",error);
        return {status:false,error:["Problem in following user"],response:{}}
    }
}
userdb.getFollowingDetails=async(data)=>{
    try
    {
        let followingQuery="select u.username,u.person_name as name, u.profile_image from followers follow, users u where follow.following_auth_token=u.auth_token ";

        let condition=" and 1=1";

        if(data.username!="")
            condition+=" and follow.follower_auth_token=(select auth_token from users where username='"+encrypt.encryptWithStringSalt(data.username,process.env.salt_string)+"')";
        else if(data.auth_token!="")
            condition+=" and follow.follower_auth_token='"+data.auth_token+"'";
        else
            return {status:false,error:["Both username and auth token cannot be empty."],response:{}};
        followingQuery+=condition;

        let followingResult= await db.fetchRecords(followingQuery);

        if(!followingResult.status)
            return followingResult;

        if(followingResult.msg.length==0)
            return {status:false,error:["Following users not found."],response:{}}

        followingResult=followingResult.msg;

        for(let i=0;i<followingResult.length;i++)
        {
            followingResult[i].username=encrypt.decrypt(followingResult[i].username,process.env.salt_string);
        }
        return {status:true,success:"Following users fetched successfully.",response:{following_details:followingResult}};
    }
    catch (error)
    {
        console.log("Exception in followPerson function::",error);
        return {status:false,error:["Problem in following user"],response:{}}
    }
}
userdb.profileSearch=async(data)=>{
    try 
    {
        
        let condition="";
        
        if(data.search!="")
        {
            condition+=" and (username like '"+encrypt.encryptWithStringSalt(data.search,process.env.salt_string)+"%'";
            condition+=" or email_id like '"+encrypt.encryptWithStringSalt(data.search,process.env.salt_string)+"%'";
            condition+=" or lower(person_name) like '"+data.search.toLowerCase()+"%'";
            condition+=" or mobile_number like '"+data.search+"%')";
        }
        
        if(condition=="")
            return {status:false,error:["Search parameter cannot be empty."],response:{}};
            
        const profileQuery="select person_name as name, username,email_id,profile_image from users where 1=1 "+condition;
        
        const profileResult=await db.fetchRecords(profileQuery);

        console.log("Profile search result",profileResult);
        
        if(!profileResult.status)
            return profileResult;
        
        if(profileResult.msg.length==0)
            return {status:false,error:["Profile not found."],response:{}};

        for(let i=0;i<profileResult.msg.length;i++)
        {
            profileResult.msg[i].username=encrypt.decrypt(profileResult.msg[i].username,process.env.salt_string);
            profileResult.msg[i].email_id=encrypt.decrypt(profileResult.msg[i].email_id,process.env.salt_string);
        }
            
        return {status:true,success:"Profile fetched successfully.",response:{profile_search:profileResult.msg}};    
    }
    catch (error)
    {
        console.log("Exception in profileSearch function::",error);
        return {status:false,error:["Problem in fetching profile details."],response:{}}
    }
}
userdb.social_login=async(data)=>{
    try
    {
        const social_query="select * from users where is_social=true and social_id='"+encrypt.encryptWithStringSalt(data.social_id,process.env.salt_string)+"'";

        const response=await db.fetchRecords(social_query);

        if(!response.status)
            return response;
        
        if(response.msg.length>0)
        {
            const userData=response.msg[0];

            if(!userData.is_social)
                return {status:false,error:["User cannot be login social account."],response:{}}

            if(userData.email_id!=encrypt.encryptWithStringSalt(data.email,process.env.salt_string))
                return {status:false,error:["Wrong email id provided."],response:{}};
            
            if(userData.social_provider!=data.provider)
                return {status:false,error:["Wrong provider details provided."],response:{}}

            return {status:true,success:"Login successfully done.",response:{auth_token:response.msg[0].auth_token}};
        }

        let validateUser=await userdb.validateUser(data);

        console.log("validate User :: ",validateUser);

        if(!validateUser.status)
        {
            console.log("Inside email validation");
            const social_query="select * from users where email_id='"+encrypt.encryptWithStringSalt(data.email,process.env.salt_string)+"'";

            const response=await db.fetchRecords(social_query);

            console.log("Fetched data :: ",response);

            if(!response.status)
                return response;

            let userData={
                is_social:true,
                social_id:encrypt.encryptWithStringSalt(data.social_id,process.env.salt_string),
                social_provider:data.provider
            }
            
            const fetchedUser=response.msg[0];

            const updateResponse=await db.updateRecords(userData,'users',"auth_token='"+fetchedUser.auth_token+"'");

            console.log("Update response :: ",updateResponse);

            if(!updateResponse.status)
                return updateResponse;

            return {status:true,success:"Login successfully done.",response:{auth_token:response.msg[0].auth_token}};
        }

        let userData={
            username:data.username,
            person_name:data.name,
            email_id:data.email,
            mobile_number:"Not mentioned",
            gender:"Not mentioned",
            dob:"",
            about_me:"Not mentioned",
            profile_image:data.photoUrl,
            background_image:"http://iic-folow.s3.ap-south-1.amazonaws.com/1595593359035images.jpg",
            password:data.password,
            is_social:true,
            social_id:data.social_id,
            last_otp_sent:"0000",
            social_provider:data.provider,
			is_email_verified:true
        }

        const userResponse=await userdb.addUser(userData);

        return userResponse;
    }
    catch (error)
    {
        console.log("Social login::::",error);
        return {status:false,error:["Problem in login using social account"],response:{}};
    }
}
module.exports=userdb;