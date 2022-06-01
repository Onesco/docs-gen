const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true})


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

module.exports = validate