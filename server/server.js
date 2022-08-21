const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const {userRouter} = require("./routes/user")
const {config, validator,httpSecurityScheme, apiKeyScheme,Oauth2Scheme} = require('docgen')


const app = express()


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
// app.use(express.urlencoded({extended: false}));

 let o2 = Oauth2Scheme('authorizationCode','header','header')
app.use('/api', router)
app.use('/users', userRouter)

// app.get('/',validator(), (req, res)=>{
//     res.send('welcome')
// })


app.get('/users',validator(null,null,null,null, o2), (req, res)=>{
    res.send('welcome')
}) 
// app.get('/header',validator(), (req, res)=>{
//     res.send('welcome')
// }) 
app.post('/users',validator({age:"number"},null,null,null,httpSecurityScheme('bearer')), (req, res)=>{
    res.send('welcome')
}) 
// app.get('/users/:id',validator(), (req, res)=>{
//     res.send('welcome')
// })
app.get('/testsss',validator(null,null,null,null,apiKeyScheme('query', 'api_key')), (req, res)=>{
    res.send('testing')
})


config({app, title:" Testing Server API", version:"4.0.1", description:"the people testing server "})

const port = 8001

app.listen(port, (err)=>{
    if (err){
        console.log(err)
    }
    console.log(`app is runnung at ${port}`)
})

