const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const {config} = require('docgen')

const app = express()



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({extended: false}));
config({app, title:"Hello world API", version:"1.0.2"})





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

