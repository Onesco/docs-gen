'use strict'

const { Router } = require("express");
const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true})



const router =  Router()

const val = {
    title: ['string', 'required', 'max=5', 'min=4'],
    name: ['string'],
    age: ['integer', 'required'],
    isTrue:['boolean','required'],
    email:['email'],
    em:['hello', 'hi'],
    obj:{
        nadme: ['string', 'required'],
        agf: ['integer', 'required'],
        er:{
            e:['integer', 'required']
        }
    },
    arr:[]
}

const f2 = (body={'a':2})=>{
    return (req, res, next)=>{
        const reqBody = req.body
        const method = req.method
        const statusCode =  req.statusCode
        const path = req.path
        const url =  req.url
        const params = req.param
        const query = req.query
        const originalUrl = req.originalUrl
        const baseUrl = req.baseUrl


        if(body){
            
            const generateProperties = (body)=>{
                let schema = {
                    type: 'object',
                    properties:{
                    },
                    required:[]
                }
                for(let key in body){
                    let validatorOperam = body[key]
                    schema.properties[`${key}`] = {}
                    let enumerable =[]
                    if(Array.isArray(validatorOperam)){
                        generateValidator(schema, key, validatorOperam, enumerable )
                        if(enumerable.length >0){
                            schema.properties[`${key}`] = {
                                enum:enumerable
                            }
                        }
                    }else if(validatorOperam  && typeof validatorOperam === 'object' && validatorOperam.constructor === Object){
                        schema.properties[`${key}`] = generateProperties(validatorOperam)
                    }
                }
                return schema
            }
            const generateValidator = (schema, key, validatorOperam, enumerable )=>{
                for(let vaop of validatorOperam){
                            if(vaop ==='required'){
                                schema.required.push(key)
                            }
                            else if(vaop=='string'){
                                schema.properties[`${key}`]['type'] = vaop
                            }
                            else if(vaop=='integer'){
                                schema.properties[`${key}`]['type'] = vaop
                            } 
                            else if(vaop=='number'){
                                schema.properties[`${key}`]['type'] = vaop
                            } 
                            else if(vaop=='boolean'){
                                schema.properties[`${key}`]['type'] = vaop
                            } 
                            else if(vaop=='email'){
                                schema.properties[`${key}`]['type'] = 'string'
                                schema.properties[`${key}`]['pattern'] = `^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$`
                            } 
                            else if(vaop.trim().search('pattern') ===0){
                                schema.properties[`${key}`]['type'] = 'string'
                                schema.properties[`${key}`]['pattern'] = `${vaop.split('pattern=')[1]}`
                            } 
                            else if(vaop.trim().search('max') ===0){
                                schema.properties[`${key}`]['maxLength'] = Number(vaop.split('max=')[1])
                            } 
                            else if(vaop.trim().search('min') ===0){
                                schema.properties[`${key}`]['minLength'] = Number(vaop.split('min=')[1])
                            }
                            else{
                                enumerable.push(vaop)
                            }      
                        }
            }
            const schema = generateProperties(body)

            let validate = ajv.compile(schema)
            const data = {
                age: 2,
                title: "khhf",
                isTrue: true,
                email:"hello@gmail.com",
                em:'hello',
                obj:{
                    nadme: 'required',
                    agf:3,
                    er:{
                        e:6
                    }
                }
              }
            const valid = validate(data)
            if (!valid) {
                res.send(validate.errors)
            }
            else{
                console.log(schema)
                next()
            }
        }
    }
}

router.get('/', f2(val), (req, res)=>{
    res.send("hello world")
})

module.exports  = {
    router
}