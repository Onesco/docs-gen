const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const swaggerUi = require('swagger-ui-express');




const app = express()



let d = {"openapi":"3.0.0","info":{"title":"Hello World","version":"1.0.0"},"servers":[{"url":"http://localhost:8000"},{"url":"https://localhost:8000"}],"paths":{"/api/users/{userid}/{id}":{"parameters":[{"name":"userid","in":"path","required":true,"schema":{"type":"string"}},{"name":"id","in":"path","required":true,"schema":{"type":"string"}}],"get":
{"description":"this is end point for /users/:userid/:id","responses":{"200":{"description":"sucessful"},"404":{"description":"bad request"},"500":{"description":"server error"}}}}}}


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(d));



app.use('/api', router)
app.get('/', (req, res)=>{
    res.send('welcome')
}) 
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


