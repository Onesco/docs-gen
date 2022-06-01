const templete =  require("../constants/swaggerTemplete.json")

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
module.exports = generateDocs