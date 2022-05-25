const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const swaggerUi = require('swagger-ui-express');




const app = express()


let templete = {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
    servers:[
        {
        url:'http://localhost:8000',
        description:'this is a testing api doc'
        }
    ],
    paths:{
        '/':{
            get:{
                description:'the come end point',
                responses:{
                    200:{
                        description:"secusseful"
                    }
                }
            }
        }
    }
}
let d = {"openapi":"3.0.0","info":{"title":"Hello World","version":"1.0.0"},"servers":[{"url":"http://localhost:8000","description":"this is a testing api doc"}],"paths":{"/":{"get":{"description":"the come end point","responses":{"200":{"description":"secusseful"}}}}}}


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(d));





app.get('/', (req, res)=>{
    res.send('welcome')
}) 



app.use('/api', router)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));

const port = 8000

app.listen(port, (err)=>{
    if (err){
        console.log(err)
    }
    console.log(`app is runnung at ${port}`)
})