const swaggerUi = require('swagger-ui-express')
const fs = require("fs")
const {dirname, join } = require("path");

const getRootPath = require("../util/getRootPath")
const getMetadata = require("./getMetadata")
const getRegisteredRoutesTemplete = require("./getRegisteredRoutes");    


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

    let jsonSchema =  fs.readFileSync(join(autoGenPath, "jsonSchema.json"))
    jsonSchema = JSON.parse(jsonSchema)
    const [routes, tem,  routesObjs] = getRegisteredRoutesTemplete(app)
    
    
    if(tem && Object.keys(jsonSchema).length < 1){
          
        let optem = JSON.parse(tem)
        
        app.use(`/${docs}`, function(req, res, next){
            let host = req.get('host');
            if(optem.servers.length === 0){
                optem.servers = [{url:'http://'+ host}];
            }
            req.swaggerDoc = optem;
            next();
        }, swaggerUi.serveFiles(optem), swaggerUi.setup());
    }

    let currentTemplate = JSON.parse(fs.readFileSync(join(autoGenPath, "swaggerDocument.json")))
    app.use(`/${docs}`,swaggerUi.serve, swaggerUi.setup(currentTemplate))
    
    if(Object.keys(jsonSchema).length > 0) {
        
        // const jsonschemaKeyList =  Object.keys(jsonSchema)
        // const jsonschemaKeyListSet = new Set(jsonschemaKeyList)

        // const routeListSet = new Set(routesList)
        // let routeToRemove = new Set([...jsonschemaKeyListSet].filter(x => !routeListSet.has(x)));
        // console.log(routesObjs)
        console.log(currentTemplate.paths)
        // console.log(routes)
    }
    
}

module.exports ={
    config
}