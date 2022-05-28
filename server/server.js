const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const swaggerUi = require('swagger-ui-express');
// const openApi = require("")

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));


let d = {"openapi":"3.0.0","info":{"title":"Hello World","version":"1.0.0"},"servers":[{"url":"http://localhost:8000"},{"url":"https://localhost:8000"}],"paths":{"/api/users":{"post":{"description":"This end point is for post  api users","responses":{"200":{"description":"sucessful","content":{"application/json":{}}},"404":{"description":"bad request","content":{"application/json":{}}},"500":{"description":"server error","content":{"application/json":{}}}},"tags":["api"],"operationId":"post_api_users","requestBody":{"content":{"application/json":{"schema":{"type":"object","properties":{"name":{"type":"string"},"age":{"anyOf":[{"type":"integer"},{"type":"number"}]},"isTrue":{"type":"boolean"},"email":{"type":"string","pattern":"^[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)*$"}},"required":["age","isTrue"],"additionalProperties":false}}}}}}}}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(d));



app.use('/api', router)
// app.use('/apiv2', router)
app.get('/', (req, res)=>{
    res.send('welcome')
}) 


const port = 8000

app.listen(port, (err)=>{
    if (err){
        console.log(err)
    }
    console.log(`app is runnung at ${port}`)
})


