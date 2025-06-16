const jwt=require('jsonwebtoken')
const authmiddleware=(req,res,next)=>{
    const bearertoken=req.headers.authorization;
    if(!bearertoken){
       return res.send({message:"Unauthorized access please login again"})
    }
    try{
        let token=bearertoken.split(' ')[1];
        const decodedtoken=jwt.verify(token,process.env.SECRET_KEY)
        req.user=decodedtoken;
        next()
    }
    catch(err){
        return res.send({message:err})
    }
}

module.exports=authmiddleware