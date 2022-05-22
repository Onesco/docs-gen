const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")

const app = express()

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