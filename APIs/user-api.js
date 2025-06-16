//create user-api
const exp=require('express')
const userapp=exp.Router()
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
require('dotenv').config()
const verifyToken=require('../middlewares/verifyToken')

//get user collection app
let usersCollection,articlesCollection;
userapp.use((req,res,next)=>{
    usersCollection=req.app.get('userscollection')
    articlesCollection=req.app.get('articlescollection')
    next()
})

//user registration route
userapp.post('/user',expressAsyncHandler(async (req,res)=>{
    //get user resource from client
    const newuser=req.body;
    const existuser=await usersCollection.findOne({username:newuser.username})
    if(existuser!==null){
        res.send({message:"User already exists"})
    }
    else{
        //hash the password
        const hashp=await bcryptjs.hash(newuser.password,6)
        //replace plain password
        newuser.password=hashp;
        //insert user
        await usersCollection.insertOne(newuser)
        res.send({message:"user successfully created"})
    }

}))

//user login router
userapp.post('/login',expressAsyncHandler(async(req,res)=>{
    const usercred=req.body;
    const existuser=await usersCollection.findOne({username:usercred.username})
    if(existuser===null){
        res.send({message:"invalid username"})
    }
    else{
        const status= await bcryptjs.compare(usercred.password,existuser.password)
        if(status===false){
            res.send({message:"invalid password"})
        }
        else{
            const signedtoken=jwt.sign({username:existuser.username,userType:usercred.userType},process.env.SECRET_KEY,{expiresIn:'1d'})
            res.send({message:"login successful",token:signedtoken,user:existuser})
            // console.log(res)
        }
    }
}))

//get articles of all users
userapp.get('/articles',verifyToken,expressAsyncHandler(async (req,res)=>{
    const articlescollection=req.app.get('articlescollection')
    let articlesList=await articlescollection.find({status:true}).toArray()
    res.send({message:"the articles list is ",payload:articlesList})
}))

userapp.post('/comment/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
    const articleid=+req.params.articleId
    const usercomment=req.body;
    let result=await articlesCollection.updateOne({articleId:articleid},{$push:{comments:usercomment}})
    const article=await articlesCollection.findOne({articleId:articleid})
    // console.log(result)
    res.send({message:"comment posted",payload:article})
}))



module.exports=userapp;