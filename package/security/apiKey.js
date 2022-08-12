const getApikey = (req, res, next, where, name) => {
    if(!req[where][name]){
        res.status(403).send({
            message:"not authenticated"
        })
        req.isInvalid = true
    }  
}

/**
 * 
 * @param {string} where e.g "query", "header" or "cookie"
 * @param {string} name e.g "API key"
 */
const apiKeyScheme = (where='header', name="api_key")=>{
    let schemeObj = {
        "type": "apiKey",
        "name": name,
        "in": where
    }
    return {
        schemeName: `apiKey`,
        "type": "apiKey",
        securityScheme:schemeObj,
        getApikey
    }
}

module.exports = apiKeyScheme