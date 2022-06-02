const swaggerUi = require('swagger-ui-express')
const fs = require("fs")
const {resolve } = require("path");

// const getRootPath = require("../util/getRootPath")
const getMetadata = require("./getMetadata")


const config = (...options)=>{
    let {
        title,
        version, 
        description,
        summary,
        termsOfService,
        license,
        contact,
        environment,
        app,
        docsPath
    } = options[0]
    
    let docs = docsPath ? docsPath : 'api-docs'
    // let autoGenPath =  join(getRootPath(dirname),"autoGens")

    const templete = getMetadata({
        title,
        version, 
        description,
        summary,
        termsOfService,
        license,
        contact
    })
 
   
   let path = resolve('../package/constants/swaggerTemplete.json')
   
    fs.writeFileSync(
        path, 
        JSON.stringify(templete),
        (err)=>{
            if(err) console.log(err)
        } 
    )

    if (environment=== "production"){
        let file = require('../schemas/swaggerDocument.json')
        app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(
            file
        ))
    }
    else{
        fs.readFile(path, "utf8", (err, file)=>{
            if(err)console.log(err)
            app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(JSON.parse(file)))
        }) 
    }

}

module.exports ={
    config
}