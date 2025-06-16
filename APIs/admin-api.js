//create admin-api
const exp=require('express')
const bcryptjs=require('bcryptjs')
const jwt=require('jsonwebtoken')
const adminapp=exp.Router()
const verifyToken=require('../middlewares/verifyToken')

let adminscollection,articlescollection,userscollection,authorscollection;
adminapp.use((req,res,next)=>{
    adminscollection=req.app.get('adminscollection')
    articlescollection=req.app.get('articlescollection')
    userscollection=req.app.get('userscollection')
    authorscollection=req.app.get('authorscollection')
    next()
})

adminapp.get('/test-admin',(req,res)=>{
    res.send({message:"this is from admin"})
})

// adminapp.post('/create',async (req,res)=>{
//     let admincred=req.body;
//     const hashp=await bcryptjs.hash(admincred.password,10)
//     admincred.password=hashp;
//     const result=await adminscollection.insertOne(admincred)
//     res.send({message:"admin created",user:admincred})

// })

adminapp.post('/login',async(req,res)=>{
    const admincred=req.body;
    const existuser=await adminscollection.findOne({username:admincred.username})
    if(existuser===null){
        res.send({message:"invalid credentials"})
    }
    else{
        const status=await bcryptjs.compare(admincred.password,existuser.password)
        if(!status){
            res.send({message:"invalid credentials"})
        }
        else{
            const signedtoken=jwt.sign({username:existuser.username,userType:"admin"},process.env.SECRET_KEY,{expiresIn:'1d'})
            res.send({message:"login successful",token:signedtoken,user:existuser})
        }
    }
})

adminapp.get('/list-of-users',verifyToken,async (req,res)=>{
    const usersList=await userscollection.find({},{username:1}).toArray()
    res.send({message:"users list is",usersList:usersList})
})

adminapp.get('/list-of-authors',verifyToken,async(req,res)=>{
    const authorslist=await authorscollection.find().toArray();
    res.send({message:"admins list is",authorsList:authorslist})
})

adminapp.get('/list-of-articles',verifyToken,async(req,res)=>{
    const articleslist=await articlescollection.find().toArray();
    res.send({message:"articles list is",articlesList:articleslist})
})

adminapp.delete('/delete-article/:articleid',verifyToken,async(req,res)=>{
    const articleid=+req.params.articleid;
    const response=await articlescollection.deleteOne({articleId:articleid})
    res.send({message:"article successfully deleted"})
})

adminapp.delete('/delete-user/:username',verifyToken,async(req,res)=>{
    const username=req.params.username;
    const response=await articlescollection.updateMany({"comments.username": username},{$pull:{comments:{username:username}}})
    // console.log(response)
    const res_1=await userscollection.deleteOne({username:username})
    // console.log(res_1)
    res.send({message:"user successfully deleted"})
})

adminapp.delete('/delete-author/:username',verifyToken,async(req,res)=>{
    const username=req.params.username;
    const response=await articlescollection.deleteMany({username:username})
    const res_1=await authorscollection.deleteOne({username:username})
    res.send({message:"author deleted successfully"})
})


module.exports=adminapp;