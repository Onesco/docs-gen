const swaggerUi = require('swagger-ui-express')
const fs = require("fs")
const {dirname, join } = require("path");

const getRootPath = require("../util/getRootPath")
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
       fs.mkdirSync(autoGenPath, {recursive:true})
       
        fs.writeFileSync(
        join(autoGenPath, "swaggerDocument.json"), 
        JSON.stringify(templete),
        (err)=>{
            if(err) console.log(err)
            } 
        )
        fs.writeFileSync(
        join(autoGenPath, "pathSchema.json"), 
        JSON.stringify({}),
        (err)=>{
            if(err) console.log(err)
            } 
        )
        fs.writeFileSync(
        join(autoGenPath, "jsonSchema.json"), 
        JSON.stringify({}),
        (err)=>{
            if(err) console.log(err)
            } 
        ) 
        fs.readFile(join(autoGenPath, "swaggerDocument.json"), "utf8", (err, file)=>{
            if(err)console.log(err)
            app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(JSON.parse(file)))
        }) 

       
   }
    else{
        if (environment=== "production"){
            let file = require(join(autoGenPath, "swaggerDocument.json"))
            app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(
                file
            ))
        }
        else{
            fs.readFile(join(autoGenPath, "swaggerDocument.json"), "utf8", (err, file)=>{
                if(err)console.log(err)
                app.use(`/${docs}`, swaggerUi.serve, swaggerUi.setup(JSON.parse(file)))
            }) 
        }
    }

}

module.exports ={
    config
}