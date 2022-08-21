'use strict'
const {Router} = require("express");
const {validator} = require('docgen')


const userRouter =  Router()

const post ={
    name: 'string required',
    age: 'number required',
    isTrue:'boolean required', 
    email:'email required', 
}
const paramSchema ={
    userId:'string required',
    commentId: 'string'
}

const querySchema ={ 
    skip:'string required',
    limit: 'string'
}



userRouter.post(`/users`, validator(post), (req, res)=>{
    res.send("hello world users" )
})
userRouter.get(`/users`, validator(null), (req, res)=>{
    res.send("hello world users" )
})
userRouter.get(`/users/:userId/`, validator({},paramSchema), (req, res)=>{
    res.send("hello world " + req.params.id)
})

userRouter.get(`/users/:userId/comments/:commentId`, validator({},paramSchema,querySchema), (req, res)=>{
    res.send("hello world " + req.params.id)
})

userRouter.get('/', validator(), (req, res)=>{
    res.send("hello world")
})

userRouter.get(`/users`, validator(null,null,querySchema), (req, res)=>{
    res.send("hello world users" )
})



module.exports  = {
    userRouter
}