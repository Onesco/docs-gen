const swaggerUi = require('swagger-ui-express')
const fs = require("fs")
const { dirname, join } = require("path");

const getRootPath = require("../util/getRootPath")
const getMetadata = require("./getMetadata")


 let environment 
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
    let autoGenPath =  join(getRootPath(dirname),"autoGens")

    const templete = getMetadata({
        title,
        version, 
        description,
        summary,
        termsOfService,
        license,
        contact
    })

    if(!fs.existsSync(autoGenPath)){
        fs.mkdirSync(autoGenPath,{recursive: true},(err)=>{if(err) console.log(err) })
        fs.writeFileSync(join(autoGenPath,"swaggerDocument.json"), JSON.stringify(templete),
            (err)=>{
                if(err) console.log(err)
            } 
        )
    }
    if (environment=== "production"){
        let file = require(join(autoGenPath,"swaggerDocument.json"))
        app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(
            file
        ))
    }
    else{
        fs.readFile(join(autoGenPath,"swaggerDocument.json"), "utf8", (err, file)=>{
            if(err)console.log(err)
            app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(JSON.parse(file)))
        }) 
    }
    
    
    environment = environment
}

module.exports ={
    environment,
    config
}