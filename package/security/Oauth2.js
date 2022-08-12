const Oauth2 = (type, authorizationUrl, tokenUrl, scopes={}, refreshUrl)=>{
    let Oauth2Object = {
        "type": "oauth2",
        "flows": {},
    }
    
    switch(type) {
        case'implicit':
            Oauth2Object.flows ={
                "implicit": {authorizationUrl,scopes}
            }
            break;
        case"authorizationCode":
            Oauth2Object.flows ={
                "authorizationCode":{ authorizationUrl,scopes,tokenUrl
                }
            }
            break;
        case"password":
            Oauth2Object.flows ={
                "password":{scopes,tokenUrl} 
            }
            break;
        case"clientCredentials":
            Oauth2Object.flows ={
                "clientCredentials":{scopes,tokenUrl}  
            }
            break;
        default:
            Oauth2Object = null

    }
    refreshUrl ? Oauth2Object.refreshUrl = refreshUrl : null
    return Oauth2Object
}

/**
 * @param {string} type e.g 'implicit' "password"  "clientCredentials", or 'authorizationCode' - required
 * @param {string} authorizationUrl -required for oauth2 ("implicit", "authorizationCode")
 * @param {string} tokenUrl -only required for oauth2 ("password", "clientCredentials", "authorizationCode")
 * @param {object} scopes The available scopes for the OAuth2 security scheme
 * @param {string} refreshUr The URL to be used for obtaining refresh tokens
 */
 const Oauth2Scheme = (type,authorizationUrl, tokenUrl, scopes, refreshUr) =>{
    return{
        schemeName: `${type}Oauth2Flow`,
        type: type,
        securityScheme:Oauth2(type,authorizationUrl, tokenUrl, scopes, refreshUr),
      
    }
}


module.exports = Oauth2Scheme
