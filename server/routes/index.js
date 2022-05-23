'use strict'

const { Router } = require("express");
const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true})



const router =  Router()

const val = {
    title: 'string required max=5 min=4',
    name: 'string',
    age: 'integer required',
    isTrue:'boolean required',
    email:'email',
    em:'hello hi',
    obj:{
        additionalProperties: true,
        required:true,
        nadme: 'string required',
        agf: 'integer required',
        er:{
            e:'integer required',
            required:true,
            additionalProperties: true,
        }
    },
    arr:['number'
    ]
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
            
            const generateSchema = (body)=>{
                let schema = {
                    type: 'object',
                    properties:{},
                    required:[],
                    additionalProperties: false
                }
                for(let key in body){

                    // allow the json object to accept additional properties
                    if(key === "additionalProperties"){
                        if(body[key]){
                            schema.additionalProperties = true
                            continue
                        }else{
                            continue
                        }
                   }   
                    // set the required field to true
                    if(body[key]?.required){
                      if(body[key].required){
                        schema.required.push(key)
                        delete body[key].required
                      }else{
                        delete body[key].required
                      }
                    }

                    let validatorOperam = body[key]
                    schema.properties[`${key}`] = {}
                    
                    if(typeof(validatorOperam)==='string'){
                        const operadList = validatorOperam.split(" ")
                        generateValidator(schema, key, operadList)
                        
                    }
                    // validator for object
                    else if(validatorOperam  && typeof validatorOperam === 'object' && validatorOperam.constructor === Object){
                        schema.properties[`${key}`] = generateSchema(validatorOperam)
                    }
                    // 
                    else if(Array.isArray(validatorOperam)){
                        // check if it is an empty array
                        schema.properties[`${key}`] = {}
                        schema.properties[`${key}`]['type'] = 'array'

                       if(validatorOperam.length === 1){
                            let item = validatorOperam[0]
                            
                            if(item  && typeof item === 'object' && item.constructor === Object){
                                schema.properties[`${key}`].items = generateSchema(item)
                            } 
                            else if(typeof(item)==='string'){
                                const operadList = item.split(" ")
                                schema.properties[`${key}`].items ={}
                                for(let itemType of operadList){
                                    if(itemType=='string'||itemType=='integer'||itemType=='number'||itemType=='boolean'){
                                        schema.properties[`${key}`]['items']['type'] = itemType
                                    } 
                                    else if(itemType.trim().search('maxItems') ===0){
                                        schema.properties[`${key}`]['items']['minItems'] = Number(itemType.split('maxItems=')[1])
                                    } 
                                    else if(itemType.trim().search('minItems') ===0){
                                        schema.properties[`${key}`]['itmes']['minItems'] = Number(itemType.split('maxItems=')[1])
                                    }
                                    else if(itemType.trim().search('uniqueItems') ===0){
                                        schema.properties[`${key}`]['itmes']['minItems'] = Boolean(itemType.split('uniqueItems=')[1])
                                    }
                                }
                                // generateValidator(schema, key, operadList)
                                // maxItems / minItems
                            }
                       }
                       else{
                        // for (let item of validatorOperam){
                        //     // check if 
                        // }
                       }
                        // if it is an empty array
 
                        // check if it is an array of objects
                        // check if it an array of arrays
                    }
                }
                return schema
            }
            const generateValidator = (schema, key, validatorOperam)=>{
                let enumerable =[]
               
                for(let vaop of validatorOperam){
                    if(vaop ==='required'){
                        schema.required.push(key)
                    }
                    else if(vaop=='string'||vaop=='integer'||vaop=='number'||vaop=='boolean'){
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
                if(enumerable.length >0){
                    schema.properties[`${key}`] = {
                        enum:enumerable
                    }
                }
            }
            const schema = generateSchema(body)

            let validate = ajv.compile(schema)
            const data = {
                age: 2,
                title: "khhf",
                isTrue: true,
                email:"hello@gmail.com",
                em:'hello',
                obj:{
                    come:3,
                    nadme: 'required',
                    agf:3,
                    er:{
                        e:4,
                        come:4,
                    }
                },
                arr:[]
              }
            const valid = validate(data)
            if (!valid) {
                console.log(schema)
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