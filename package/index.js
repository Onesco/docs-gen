const _ = require('lodash')
const fs = require('fs');
const {dirname, join} = require("path");

const {config} = require('./config/setting')

const getAuthorizationHeader = require("./security/util")

const validate = require("./util/validate")
const generateDocs = require("./util/generateDocs")
const getRoutePath = require("./util/getRootPath")

const autoGenPath =  join(getRoutePath(dirname),"autoGens")

const {
    validateBody,
    validateParams,
    validateQuery
} = require("./util/pathOperation");


// the entry validation function
const validator = (body, paramSchema, querySchema={}, headerSchema={}, authStrategy) => 
 async (req, res, next) => {
    
    const method = req.method.toLocaleLowerCase()
    const {params, query, baseUrl, headers} = req
    const {host} = headers
    const route = req.route.path

    const newPath = method+baseUrl+route
    const newPathSchema = {}
    newPathSchema[`${newPath}`] = {body,paramSchema,querySchema}


    // load the previous the path and json schemas    
    let jsonSchema =  JSON.parse(fs.readFileSync(join(autoGenPath,"jsonSchema.json")))
    let pathSchema =   JSON.parse(fs.readFileSync(join(autoGenPath,"pathSchema.json")))
      
    // check if this end point has already a Jsonschema for the path operation
    // then check if any field value of the pathSchema has changed then generated new JsonSchemas
    // else used the already generated schema
   let token
   let obj = {body,paramSchema,querySchema}
   
    if(jsonSchema.hasOwnProperty(newPath) && _.isEqual(pathSchema[`${newPath}`], JSON.parse(JSON.stringify(obj)))){
       
        let {bodySchema,paramsSchema,qSchema} = jsonSchema[`${newPath}`]
        paramsSchema ? validate(paramsSchema, params, req, res) : null
        qSchema ? validate(qSchema, query, req, res) : null
        bodySchema ? validate(bodySchema, req.body, req, res): null

        if(authStrategy){
           token = await getAuthorizationHeader(req, res, next)
           req.token = token
        }
        else{
            if(!req?.isInvalid){
                try {
                    next()
                } catch (error) {
                }
            }
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
         // validate header
         if(headerSchema && Object.keys(headerSchema).length > 0){
             headerSchema.additionalProperties = true
            validateParams(headerSchema, headers, req, res) 
        }

        // validate body schema since the method is not "get"
        if(method ==='post'|| method ==='put' || method ==='patch'|| method ==='delete'){ 
            if(body && Object.keys(body).length > 0 ){
                validateBody(body, req, res)
            }else{
                if(method !=="delete"){
                    return res.status(406).send({
                        errorType:"validation error",
                        message:"can't valdate empty body schema. Please provide the body schema"
                    })
                }
            }
        }

        if(authStrategy){
            token = await getAuthorizationHeader(req, res, next)
            req.token = token
        }
        else{
            if(!req?.isInvalid){
                try {
                    next()
                } catch (error) {
                }
            }
        }

        // generate json schemas for the path operation
        let {bodySchema, paramsSchema, qSchema} = req
        // console.log(qSchema, querySchema)
          // generate documentation for the path
        const {openAPI} = generateDocs({
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
     
        // write the openApi and json schema to a file
        fs.writeFile(join(autoGenPath,"swaggerDocument.json"),openAPI,(err)=>{})
        fs.writeFile(join(autoGenPath,"jsonSchema.json"),JSON.stringify(jsonSchema),(err)=>{})
        fs.writeFile(join(autoGenPath,"pathSchema.json"),JSON.stringify(pathSchema),(err)=>{})
        // move the next route function after validation
        // if(token){   
        //     next()
        // }
    }
}
module.exports = {
    validator,
    config,
    getAuthorizationHeader,
    generateDocs 
}
