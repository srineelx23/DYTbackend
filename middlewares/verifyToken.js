const jwt=require('jsonwebtoken')
require('dotenv').config()
const verifyToken=(req,res,next)=>{
    const bearertoken=req.headers.authorization;
    if(!bearertoken){
       return res.send({message:"Unauthorized access Please Login to continue"})
    }
    const token=bearertoken.split(' ')[1]
    try{
        jwt.verify(token,process.env.SECRET_KEY)
        next()
    }
    catch(err){
        next(err)
    }
}

module.exports=verifyToken