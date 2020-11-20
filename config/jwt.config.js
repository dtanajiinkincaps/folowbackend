const jwt = require('jsonwebtoken')

module.exports =
{
    
    genToken    : function(payload)
    {
        console.log("Token Generation")
        return new Promise(function(resolve,reject)
        {
            jwt.sign({payload},process.env.jwtSecret,{expiresIn : '31d'},function(err,token)
            {
                if(err)
                {
                    console.log(err);
                    reject(err);
                }
                else
                {
                    resolve(token);
                }
            });
        });
    },


    checkToken : function(req,res,next){
        console.log("Check Token")
        // const header = req.headers.authorization;
        const header = req.body.authorization;
        if(typeof header !== 'undefined'){
            const bearer = header.split(' ');
            const token = bearer[1]
            // console.log(token)
            jwt.verify(token,process.env.jwtSecret,function (err,authorizedata){
                if(err)
                {
                    res.status(403).json({message : err.message});
                }
                else
                {
                    
                    req.payload=authorizedata.payload;
                    next();
                }
            });
        }
        else{
            res.status(403).json({message : "Authorization Failed"});
        }
    }    
}
