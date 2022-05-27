'use strict'
const { Router } = require("express");
const Ajv = require("ajv");
const fs = require('fs')
const os = require('os')


const ajv = new Ajv({allErrors: true})


const router =  Router()


const val = {
    title: 'string required max=5 min=4',
    name: 'string',
    age: 'number|integer required',
    isTrue:'boolean required',
    email:'email',
    additionalProperties: true,
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
    arr:[]
}

let templete = {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
    servers: [],
    paths:{ 
    }
}
// generate metedata
// const getMetaData = ()=>{
//     console.log(os.homedir())
// }

const geberateDoc = (...args)=>{

    args  = args[0]
    let {method, params, baseUrl,route, host }= args
    
    let path = baseUrl + route

    if(Object.keys(params).length > 0) {       
        for(let key of Object.keys(params)){
            path = path.replace(`:${key}`,   `{${key}}`)
        }
    }
    
    let httpHost = {url:`http://${host}`}
    let httpsHost = {url:`https://${host}`}
    let formal = templete.servers
   

    if (templete.servers.length==0){
        templete.servers = [httpHost, httpsHost]
    }else{

    }
      
    templete.paths[`${path}`] ={}
    let parameters = []
    if(Object.keys(params).length > 0) {
        for(let key of Object.keys(params)){
            parameters = [...parameters, {
                name:key,
                in :'path',
                required : true,
                schema :{type:"string"}
            }] 
        }
        
        templete.paths[`${path}`].parameters = parameters 
        parameters = []
    }

    templete.paths[`${path}`][`${method}`] = {
        description:`this is end point for ${route}`,
        responses:{
            200:{
                description:"sucessful"
            },
            404:{
                description:"bad request"
            },
            500:{
                description:"server error"
            }
        }
    }
  
    console.log(JSON.stringify(templete))
}

const validateBody =(body, res, req, next)=>{

    const reqBody = req.body
   
    if(Object.keys(body).length === 0){
        return res.status(406).send({
            errorType:"validation error",
            message:"can not valdate empty body. Please provide the body object"
        })
    }
            
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
            // set the required field to true if provided
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
            
            // validation for all non object and array data type 
            //  (i.e: string, number, integer, boolean, enum, email, any, pattern)
            if(typeof(validatorOperam)==='string'){
                const operadList = validatorOperam.split(" ")
                generateValidator(schema, key, operadList)   
            }
            // validation for object
            else if(validatorOperam  && typeof validatorOperam === 'object' && validatorOperam.constructor === Object){
                schema.properties[`${key}`] = generateSchema(validatorOperam)
            }
            // validation for array
            else if(Array.isArray(validatorOperam)){
                // check if it is an empty array
                schema.properties[`${key}`] = {}
                schema.properties[`${key}`]['type'] = 'array'

                // check if it an array with one element 
                if(validatorOperam.length === 1){
                    let item = validatorOperam[0]
                    
                    // check if the single element in the array is of type stringis an object
                    if(item  && typeof item === 'object' && item.constructor === Object){
                        schema.properties[`${key}`].items = generateSchema(item)
                    } 
                    // check if the single element of the array is type string
                    else if(typeof(item)==='string'){
                        const operadList = item.split(" ")
                        schema.properties[`${key}`].items ={}
                        
                        for(let itemType of operadList){
                            generateArrayItemValidator(schema, key, itemType)
                        }
                    }
                }
                else{
                    for (let item of validatorOperam){
                        generateArrayItemValidator(schema, key, item)
                    }
                }
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
            else if(vaop.trim().search('any') ===0){
                schema.properties[`${key}`]['anyOf'] = [{type: "string"},{type: "number"}, {type: "integer"},{type: "boolean"}, {type: "object"}]
            }
            else if(vaop.trim().indexOf('|') !==-1){
                let types = vaop.split('|')
                schema.properties[`${key}`]['anyOf'] = []
                for(let type of types){
                schema.properties[`${key}`]['anyOf'].push({type})
                }
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
    const generateArrayItemValidator = (schema, key, item)=>{
        if(item  && typeof item === 'object' && item.constructor === Object){
            schema.properties[`${key}`].items = generateSchema(item)
        }
        else if(item=='string'||item=='integer'||item=='number'||item=='boolean'){
            schema.properties[`${key}`]['items'] = {}
            schema.properties[`${key}`]['items']['type'] = item
        }
        
        else if(item.trim().search('maxItems') === 0){
            schema.properties[`${key}`]['maxItems'] = Number(item.split('maxItems=')[1])
        }

        else if(item.trim().search('minItems') === 0){
            schema.properties[`${key}`]['minItems'] = Number(item.split('minItems=')[1])
        }

        else if(item.trim().search('uniqueItems') === 0){
            schema.properties[`${key}`]['uniqueItems']  = true
        }
        else if(item.trim().search('any') === 0){
            schema.properties[`${key}`]['items'] = {}
            schema.properties[`${key}`]['items']['anyOf'] = [
                {type: "string"},{type: "number"}, 
                {type: "integer"},{type: "boolean"}, 
                {type: "object"}
            ]
        }
    }
    
    const schema = generateSchema(body)

    // fs.writeFile('swaggerJSDos.json', )

    let validate = ajv.compile(schema)
    
    const data = {
        age: 3,
        name:'john doe',
        title: "khhf",
        isTrue: true,
        email:"hello@gmail.com",
        em:'hello',
        obj:{
            come:3,
            nadme: 'required',
            agf:3,
            er:{
                e:"hello",
                come:4,
            }
        },
        arr:[{}]
        }

    const valid = validate(data)
    if (valid) {
        // console.log(schema.properties.arr)
        next()
    }
    else{
        // console.log(schema.properties.arr)
        res.send(validate.errors)
        
    }
}

const validator= (body={}) => (req, res, next) => {
    
    const method = req.method.toLocaleLowerCase()
    const params = req.params
    const query = req.query
    const baseUrl = req.baseUrl
    const host = req.headers.host
    const route = req.route.path

    // validate param
    //  validate query
    // validate body schema
    validateBody(body, req, res, next)
    geberateDoc({method, params, baseUrl, route,host})
}
  

router.get(`/users/:userid/:id`, validator(val), (req, res)=>{
    res.send("hello world " + req.params.id)
})

router.get('/', validator(val), (req, res)=>{
    res.send("hello world")
})

router.get(`/users`, validator(val), (req, res)=>{
    res.send("hello world users" )
})

module.exports  = {
    router
}