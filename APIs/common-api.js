const exp=require('express')
const commonapp=exp.Router()
const authmiddleware=require('../middlewares/authmiddleware')

commonapp.get('/reload',authmiddleware,(req,res)=>{
    const user=req.user
    res.send({message:"user sent",user:user})
})




module.exports=commonapp;