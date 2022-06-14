'use strict'
const {Router} = require("express");
const {validator} = require('docgen')


const router =  Router()

const post ={
    name: 'string',
    age: 'number required',
    isTrue:'boolean required',
    email:'email',
}
const paramSchema ={
    userId:'string required',
    commentId: 'string'
}

const querySchema ={ 
    skip:'string required',
    limit: 'string'
}


router.get('/users',validator(), (req, res)=>{
    res.send("hello world")
})

router.post(`/users`, validator(post), (req, res)=>{
    res.send("hello world users" )
})
router.get(`/users/mess`, validator(null), (req, res)=>{
    res.send("hello world users" )
})
router.get(`/users/:userId/`, validator({},paramSchema), (req, res)=>{
    res.send("hello world " + req.params.id)
})

router.get(`/users/:userId/comments/:commentId`, validator({},paramSchema,querySchema), (req, res)=>{
    res.send("hello world " + req.params.id)
})

router.get('/', validator(), (req, res)=>{
    res.send("hello world")
})

router.get(`/users`, validator(null,null,querySchema), (req, res)=>{
    res.send("hello world users" )
})



module.exports  = {
    router
}