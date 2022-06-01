const generateSchema = require("./generateScema")
const validate = require("./validate")

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

module.exports ={
    validateBody,
    validateParams,
    validateQuery
}