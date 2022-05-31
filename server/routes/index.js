'use strict'
const { Router } = require("express");
const Ajv = require("ajv");
const fs = require('fs');
const path = require("path");
const { dirname } = require("path");
const _ = require('lodash')
const openApi = require('../autoGen/openApi.json')


const ajv = new Ajv({allErrors: true})


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

const jsonSchema ={}
const pathSchema = {}

const getRoutePath = (dirname)=> dirname(require.main.fiename 
    || process.mainModule.filename)


// let templete = JSON.parse(fs.readFileSync(path.join(getRoutePath(dirname),"autoGen/openApi.json"), "utf8"))
let templete = openApi

// console.log(__dirname)
let options = {
    title: 'Testing API',
    version: '2.0.4',
    description:"",
    summary:"",
    termsOfService:"",
    license:"",
    contact:""
}
// get the root path of the project

const getMetaData = (...args)=>{
    const {
        title,
        version, 
        description,
        summary,
        termsOfService,
        license,
        contact
    } = args[0]
    let packageFilePath = path.join(getRoutePath(dirname),"package.json")

    if(!title || !version){
        fs.readFile(packageFilePath, (err, file)=>{
            if (err) console.log(err)
            file = JSON.parse(file)
            let {name, version, description} = file
            templete.info.title = name
            templete.info.version = version
            templete.info.description = description
        })
    }else{
        templete.info = {
        ...templete.info,title, version, description,summary,termsOfService,
        license,
        contact
        }
    }

}
getMetaData(options)
// utilitiy functions
function generateDocs(...args) {

    args = args[0];
    let { 
        method, 
        params,
        querySchema, 
        baseUrl,
        route, 
        host, 
        bodySchema,
        paramsSchema,
        qSchema
    } = args;

    let path = baseUrl + route;

    // replace the :id to {id} on path parameter
    // get operationID path
    let opPath = path;
    if (Object.keys(params).length > 0) {
        for (let key of Object.keys(params)) {
            path = path.replace(`:${key}`, `{${key}}`);
            opPath = opPath.replace(`:${key}`, `By${key}`);
        }
    }

    let httpHost = { url: `http://${host}` };
    let httpsHost = { url: `https://${host}` };


    if (templete.servers.length == 0) {
        templete.servers = [httpHost, httpsHost];
    } else {
    }

    templete.paths[`${path}`] = {};
    let parameters = [];

    // params schema docs set up
    if (Object.keys(params).length > 0) {
        for (let key of Object.keys(params)) {
            parameters = [...parameters, {
                name: key,
                in: 'path',
                required: !paramsSchema?.required?.indexOf(key),
                schema: paramsSchema?.properties?.key
            }];
        }
        templete.paths[`${path}`].parameters = parameters;
    }

    // query schema docs set up
    if (Object.keys(querySchema).length > 0) {
        for (let key of Object.keys(querySchema)) {
            parameters = [...parameters, {
                name: key,
                in: 'query',
                required: !qSchema?.required?.indexOf(key),
                schema: qSchema?.properties?.key
            }];
        }
        templete.paths[`${path}`].parameters = parameters;
        parameters = [];
    } else {
        parameters = [];
    }


    opPath = opPath.split('/');
    let desscription = opPath.join(' ');
    let operationId = opPath.join('_');

    baseUrl = baseUrl === "" ? baseUrl : baseUrl.split('/')[1];
    templete.paths[`${path}`][`${method}`] = {
        description: `This end point is for ${method}ing ${desscription}`,
        responses: {
            200: {
                description: "sucessful",
                content:{
                    "application/json": {
                    }
                }
            },
            404: {
                description: "bad request",
            },
            500: {
                description: "server error",
            }
        },
        tags: [baseUrl],
        operationId: `${method}${operationId}`,
        
    };

    // set the request body schema for proper documentation
    if(bodySchema){
        templete.paths[`${path}`][`${method}`].requestBody = {
            content:{
                "application/json": {
                    "schema":bodySchema
                }
            }
        }
        
    }
return {
    operationId,
    openAPI:JSON.stringify(templete)
    }
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
            generateValidatorPerSchemaKey(schema, key, operadList)   
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
const generateValidatorPerSchemaKey = (schema, key, validatorOperam)=>{
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
const validate = (schema, reqBody, req, res, next)=>{
    const validate = ajv.compile(schema)
    
    const valid = validate(reqBody)
    if (valid) {
        if(next) next()
    }
    else{
        req.isInvalid = true
        res.status(406).send(validate.errors)  
    }
}


// the form  body  validator
const validateBody =(body, req, res,next)=>{

    const reqBody = req.body
    const schema = generateSchema(body)
    req.bodySchema = schema
    
    validate(schema, reqBody, req, res, next)
}

// validate params utility function
const validateParams = (paramSchema, params, req, res)=>{     
    const schema = generateSchema(paramSchema)
    req.paramsSchema = schema
    validate(schema, params, req, res)
}

// validate query utility function
const validateQuery = (querySchema, query, req, res)=>{     
    const schema = generateSchema(querySchema)
    req.qSchema = schema
    validate(schema, query, req, res)
}
// validate response utility function
const validateResponse = (responseSchema, req, res)=>{     
    const schema = generateSchema(responseSchema)
}

// the entry validation function
const validator= (body, paramSchema, querySchema={}) => 
(req, res, next) => {
    
    const method = req.method.toLocaleLowerCase()
    const {params, query, baseUrl} = req
    const host = req.headers.host
    const route = req.route.path

    const newPath = method+baseUrl+route
    const newPathSchema = {}
    newPathSchema[`${newPath}`] = {body,paramSchema,querySchema}
    
    // check if this end point has already Jsonschemas for the path operation
    // then check if any field value of the pathSchema has changed then generated new JsonSchemas
   
    if(jsonSchema.hasOwnProperty(newPath) && _.isEqual(pathSchema[`${newPath}`], {body,paramSchema,querySchema})){
        console.log('second click')
       
        let {bodySchema,paramsSchema,qSchema} = jsonSchema[`${newPath}`]
        
        paramsSchema ? validate(paramsSchema, params, req, res) : null
        qSchema ? validate(qSchema, query, req, res) : null
        bodySchema ? validate(bodySchema, req.body, req, res, next): null

        // move the next route function after validation
        if(!req?.isInvalid){
            next()
        }
    } 
    // if the path is new one then validate its path operations
    else{
            // validate query
        if(querySchema && Object.keys(querySchema).length > 0){
            validateQuery(querySchema, query, req, res) 
        }
        // validate params
        if(paramSchema && Object.keys(paramSchema).length > 0){
            validateParams(paramSchema, params, req, res) 
        }

        // validate body schema since the method is not "get"
        if(method !=='get'){
            
            if(body && Object.keys(body).length > 0 ){
                validateBody(body, req, res, next)
            }else{
                return res.status(406).send({
                errorType:"validation error",
                message:"can't valdate empty body schema. Please provide the body schema"
                })
            }
        }
        // generate json schemas for the path operation
        let {bodySchema, paramsSchema, qSchema} = req
        
          // generate documentation for the path
        const {operationId, openAPI} = generateDocs({
            method, 
            params, 
            querySchema,
            baseUrl, 
            route,
            host, 
            bodySchema,
            paramsSchema,
            qSchema
        })

        
        // the generated json path schema
        jsonSchema[`${newPath}`] ={
            bodySchema,
            paramsSchema,
            qSchema
        }
        // raw path schema
        pathSchema[`${newPath}`] = {
            body,paramSchema,querySchema 
        }
        console.log("first click")
        // write the openApi and json schema to a file
        fs.writeFile(path.join(getRoutePath(dirname),"autoGen/openApi.json"),openAPI, (err)=>{console.log(err)})
        fs.writeFile(path.join(getRoutePath(dirname),"autoGen/jsonSchema.json"),JSON.stringify(jsonSchema), (err)=>{console.log(err)})
        // move the next route function after validation
        if(!req?.isInvalid){
            next()
        }
    }
}
  









router.get(`/users/:userId/`, validator({},paramSchema), (req, res)=>{
    res.send("hello world " + req.params.id)
})
router.get(`/users/:userId/comments`, validator(), (req, res)=>{
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
router.post(`/users`, validator(post), (req, res)=>{
    res.send("hello world users" )
})

module.exports  = {
    router
}