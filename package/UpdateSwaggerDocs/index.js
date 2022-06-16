const getRegisteredRoutes  = require("./getRegisteredRoutes")

const  updateSwaggerDocs = (app,autoGenPath, join)=>{
    const registeredRoutes = getRegisteredRoutes(app)
    const swaggerDocument = require(join(autoGenPath, "swaggerDocument.json"))
    console.log(registeredRoutes)
   
}

module.exports = updateSwaggerDocs