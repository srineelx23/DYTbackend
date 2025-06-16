const exp=require('express')
const app=exp();
const mongoClient=require('mongodb').MongoClient
require('dotenv').config()
const path=require('path')
const cors=require('cors')


//deploy react bulid into the server
app.use(exp.static(path.join(__dirname,'../client/build')))
//body parser
app.use(exp.json())

app.use(cors({
  origin: 'https://incandescent-frangollo-e2b034.netlify.app',
  credentials: true
}));

//connect to db
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    const dbObj=client.db('blogdb')
    const dbCollectionObj=dbObj.collection('userscollection')
    const authorscollection=dbObj.collection('authorscollection')
    const articlescollection=dbObj.collection('articlescollection')
    const adminscollection=dbObj.collection('adminscollection')
    app.set('userscollection',dbCollectionObj)
    app.set('articlescollection',articlescollection)
    app.set('authorscollection',authorscollection)
    app.set('adminscollection',adminscollection)
    console.log("DB connection success to Atlas")
})
.catch(err=>console.log("Err is DB connection",err))

//import routes
const userapp=require('./APIs/user-api')
const authorapp=require('./APIs/author-api')
const adminapp=require('./APIs/admin-api')
const commonapp=require('./APIs/common-api')

//requests according to api
app.use('/user-api',userapp)
app.use('/author-api',authorapp)
app.use('/admin-api',adminapp)
app.use('/common-api',commonapp)

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
})

//error handling middleware
app.use((err,req,res,next)=>{
    res.send({message:"error",payload:err.message})
})

const port=process.env.PORT || 5000;
app.listen(port,()=>console.log(`server on port ${port}`))