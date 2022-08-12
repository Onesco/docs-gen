const util = require('./util')

const httpSecurityObj = (scheme="bearer")=>{
    let schemeObject = {
        "type": "http",
        "scheme": scheme,
    }
    scheme==="bearer" ? schemeObject["bearerFormat"] = "JWT": null
    return schemeObject
}

/**
 * @param {string} scheme e.g "bearer" or "basic" 
 */
 const httpSecurityScheme = (scheme)=>{
    return{
        schemeName: `${scheme}Oauth2Flow`,
        type: scheme,
        securityScheme:httpSecurityObj(scheme),
        getToken:util
    }
}

module.exports = httpSecurityScheme