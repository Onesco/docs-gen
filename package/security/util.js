'use strict';

const getAuthorizationHeader = async (req, res, next)=>{
    
    const authHeader = req.get('authorization');
    if(!authHeader){
        res.status(403).send({
            message:"not authenticated"
        })
        req.isInvalid = true
    }
    else{
        let tokenObj = await getAuthorizationToken(authHeader, res, req, next)
        return tokenObj
    }
}

const getAuthorizationToken = async (authHeader, res, req, next)=>{

    let token;
    let type;
    if (authHeader && authHeader.length!==0) {
        // get both the type from authorization header
        let typeTokenArray = authHeader.split(' ');
        type = typeTokenArray[0]
        token = typeTokenArray[1]
    }
   
    if (!token) {
        res.status(403).send({
            message:"not authenticated"
        })
        req.isInvalid = true
    }else{
        req.token ={token,type}
    }
}

module.exports = getAuthorizationHeader