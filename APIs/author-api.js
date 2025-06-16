//create author-api
const exp=require('express')
const authorapp=exp.Router()
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
const bcryptjs=require('bcryptjs')
require('dotenv').config()
const verifyToken=require('../middlewares/verifyToken')

let authorsCollection;
let articlescollection;
authorapp.use((req,res,next)=>{
    authorsCollection=req.app.get('authorscollection')
    articlesCollection=req.app.get('articlescollection')
    next()
})

authorapp.post('/user',expressAsyncHandler(async(req,res)=>{
    let authorcred=req.body;
    const existuser=await authorsCollection.findOne({username:authorcred.username})
    if(existuser!==null){
        res.send({message:"Author already exists"})
    }
    else{
        const hashp=await bcryptjs.hash(authorcred.password,6)
        authorcred.password=hashp;
        await authorsCollection.insertOne(authorcred)
        res.send({message:"Author successfully created"})
    }
}))

authorapp.post('/login',expressAsyncHandler(async (req,res)=>{
    const authorcred=req.body;
    const existuser=await authorsCollection.findOne({username:authorcred.username})
    if(existuser===null){
        res.send({message:"invalid username"})
    }
    else{
        const status=await bcryptjs.compare(authorcred.password,existuser.password)
        if(!status){
            res.send({message:"invalid password"})
        }
        else{
            const signedtoken=jwt.sign({username:existuser.username,userType:authorcred.userType},process.env.SECRET_KEY,{expiresIn:'1d'})
            res.send({message:"login successful",token:signedtoken,user:existuser})
        }
    }
}))

//adding new article by author
authorapp.post('/article',verifyToken,expressAsyncHandler(async (req,res)=>{
    const newArticle=req.body;
    await articlesCollection.insertOne(newArticle)
    res.send({message:"article created"})
}))

//modifying the article
authorapp.put('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
    const modifiedArticle=req.body;
   let result= await articlesCollection.updateOne({articleId:modifiedArticle.articleId},{$set:{...modifiedArticle}})
   let latestArticle=await articlesCollection.findOne({articleId:modifiedArticle.articleId})
   res.send({message:"article modified",article:latestArticle})
}))

//deleting the article
authorapp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
    const articleid=+req.params.articleId;
    const articleObj=req.body;
    if(articleObj.status===false){
        await articlesCollection.updateOne({articleId:articleid},{$set:{status:true}})
        res.send({message:"Article opened"})
    }
    else{
    await articlesCollection.updateOne({articleId:articleid},{$set:{status:false}})
    res.send({message:"Article removed"})
    }
}))

//reading articles of that particle user
authorapp.get('/articles/:username',verifyToken,expressAsyncHandler(async(req,res)=>{
    const authorname=req.params.username;
    const articlesList=await articlesCollection.find({username:authorname}).toArray()
    res.send({message:"list of articles is ",payload:articlesList})
}))

module.exports=authorapp;