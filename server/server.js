const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const swaggerUi = require('swagger-ui-express')
const openApi = require("./autoGen/openApi.json")

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApi));



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

