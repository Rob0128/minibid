const express = require('express')
const router = express.Router()

const User = require('../models/User')
const {registerValidation, loginValidation} = require('../validations/validation')

const bcript = require('bcryptjs')

const jsonwebtoken = require('jsonwebtoken')

router.post('/register', async(req,res)=>{

    //requests validation to check user input
    const {error} = registerValidation(req.body)
    if(error){
        return res.send(error.message)
    }

    //checks if user exists
    const userExists = await User.findOne({email:req.body.email})
    if(userExists){
        return res.status(400).send({message: "User exists"})
    }

    //created hashed representation of my password
    const salt = await bcript.genSalt(5)
    const hashedPassword = await bcript.hash(req.body.password,salt)

    //code to insert data
    const user = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword
    })
    try{
        const savedUser = await user.save()
        res.send(savedUser)
    }
    catch(err){
        res.status(400).send({message:err})
    }
})

router.post('/login', async(req,res)=>{
    //validation to check user input
    const {error} = loginValidation(req.body)
    if(error){
        return res.send(error.message)
    }

    //check if user exists
    const userExists = await User.findOne({email:req.body.email})
    if(!userExists){
        return res.status(400).send({message: "User does not exist"})
    }

    //check if user password is correct
    const passwordValidation = await bcript.compare(req.body.password, userExists.password)
    if(!passwordValidation){
        return res.status(400).send({message: "Password ain't right"})
    }
    
    //get token
    const token = jsonwebtoken.sign({_id:userExists._id}, process.env.TOKEN_SECRET)
    res.header('auth-token', token)
    res.header('user', req.body.email).send({'auth-token':token, 'user':req.body.email})

})

module.exports = router