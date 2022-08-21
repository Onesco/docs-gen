const swaggerUi = require('swagger-ui-express')
const express =  require("express")
const fs = require("fs")
const app = express()
const { join, dirname} = require('path')


const getRoutePath = require("./getRootPath")
const autoGenPath = join(getRoutePath(dirname),"autoGens")

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
        qSchema,
        update,
        securityScheme,
        schemeName
    } = args;
    
    let templete = require(join(autoGenPath, "swaggerDocument.json"))
    if(update){
        templete = JSON.parse(fs.readFileSync(join(autoGenPath, "swaggerDocument.json")))
    }
    let path = baseUrl + route;
   
    // replace the :id to {id} on path parameter
    // get operationID path
    let opPath = path;
    if (params && Object.keys(params).length > 0) {
        for (let key of Object.keys(params)) {
            path = path.replace(`:${key}`, `{${key}}`);
            opPath = opPath.replace(`:${key}`, `By ${key}`);
        }
    }
    let httpHost
    let httpsHost
    if(host){
        httpHost = { url: `http://${host}` };
        httpsHost = { url: `https://${host}` };
    }

    if (host && templete.servers.length == 0) {
        templete.servers = [httpHost, httpsHost];
    } else {
    }

    if(!templete.paths[`${path}`]){
        templete.paths[`${path}`] = {};
    }

    templete.paths[`${path}`][`${method}`]  = {};

    let parameters = [];

    let defaultParamSchema = {type: 'string'}
    // params schema docs set up
    if (params && Object.keys(params).length > 0) {
        for (let key of Object.keys(params)) {
            parameters = [...parameters, {
                name: key,
                in: 'path',
                required: !paramsSchema?.required?.indexOf(key) || true,
                schema: paramsSchema?.properties[`${key}`] || defaultParamSchema
            }];
        }
        templete.paths[`${path}`][`${method}`].parameters = parameters;
    }
    // query schema docs set up
    if (querySchema && Object.keys(querySchema).length > 0) {
        for (let key of Object.keys(querySchema)) {
            
            parameters = [...parameters, {
                name: key,
                in: 'query',
                required: !qSchema?.required?.indexOf(key),
                schema: qSchema?.properties[`${key}`]
            }];
        }
        
        templete.paths[`${path}`][`${method}`]['parameters'] = parameters;
        parameters = [];
    } else {
        parameters = [];
    }


    opPath = opPath.split('/');
    let desscription = opPath.join(' ');
    let operationId = opPath.join('_');

    baseUrl = baseUrl === "" ? baseUrl : baseUrl.split('/')[1];
    templete.paths[`${path}`][`${method}`] = {
        ...templete.paths[`${path}`][`${method}`],
        description: `This end point is for ${method}ing ${desscription}`,
        summary: `${method} ${desscription}`,
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
        templete.components.schemas[`${method}${operationId}`] = bodySchema
        templete.paths[`${path}`][`${method}`].requestBody = {
            content:{
                "application/json": {
                    "schema":{
                        "$ref": `#/components/schemas/${method}${operationId}`
                    }
                },
                "application/xml": {
                    "schema":{
                        "$ref": `#/components/schemas/${method}${operationId}`
                    }
                },
                "application/x-www-form-urlencoded": {
                    "schema":{
                        "$ref": `#/components/schemas/${method}${operationId}`
                    }
                },
                "multipart/form-data": {
                    "schema":{
                        "$ref": `#/components/schemas/${method}${operationId}`
                    }
                },
                "image/png": {
                    "schema":{
                        "$ref": `#/components/schemas/${method}${operationId}`
                    }
                },
                "application/octet-stream": {
                    "schema":{
                        "$ref": `#/components/schemas/${method}${operationId}`
                    }
                },
            }
        } 
    }
    // add the security scheme to the security schemes of the router component  
    if(securityScheme){
        templete.components.securitySchemes[schemeName] = securityScheme
        let schemeObj = {}
        schemeObj[schemeName] =[]
        templete.paths[`${path}`][`${method}`]['security'] = [schemeObj]
    }
    // load the swaggerUI to update the documentation page
    app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(templete))
    
return {
    operationId: `${method}${operationId}`,
    openAPI:JSON.stringify(templete)
    }
}

module.exports = generateDocs