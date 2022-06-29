const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true})


const validate = (schema, reqBody, req, res)=>{
    const validate = ajv.compile(schema)
    
    const valid = validate(reqBody)
    if (!valid) {
        // check if there is unhandled validation error before
        if(!req.isInvalid){
            res.status(406).send(validate.errors)  
        }
        // set new validation error to be handled
        req.isInvalid = true 
    }
}

module.exports = validate