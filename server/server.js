const express =  require("express")
const bodyParser = require('body-parser')
const {router} = require("./routes/index")
const userRoutes = require("./routes/users")
const {config, validator,getAuthorizationHeader} = require('docgen')
const { sum } = require("lodash")

const app = express()



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
// app.use(express.urlencoded({extended: false}));

config({app, title:"Testing API", version:"1.0.0"})


app.use('/api/come/john/sfillip', router)
// app.use('/users', userRoutes)

// app.get('/',validator(), (req, res)=>{
//     res.send('welcome')
// }) 
// app.get('/users',validator(), (req, res)=>{
//     res.send('welcome')
// }) 
// app.get('/header',validator(), (req, res)=>{
//     res.send('welcome')
// }) 
// app.post('/users',validator({age:"number"},null,null,null,getAuthorizationHeader), (req, res)=>{
//     res.send('welcome')
// }) 
// app.get('/users/:id',validator(), (req, res)=>{
//     res.send('welcome')
// })
// app.get('/testsss',validator(null,null,null,null,getAuthorizationHeader), (req, res)=>{
//     res.send('testing')
// })



let route, routes = [];

app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        routes.push({
            path:middleware.route.path,
            method: middleware.route.methods
        });
    } else if(middleware.name === 'router'){ // router middleware 
       let test =[]
       let n = 10000
       for(let i=0; i<n; i++){
        let routeregExp = middleware.regexp.toString()
        let startTime = Date.now()
        routeregExp.match(/\w+[^\\]/ig).join('/')
        // routeregExp.slice(3,-11).split('\\').join('')

        
        let Endtime = Date.now()
        test.push(Endtime - startTime) 
       }
       console.log(sum(test)/n)
        // middleware.handle.stack.forEach(function(handler){
        // //    console.info(handler)
        //     route = handler.route;
        //     route && routes.push({
        //         path:route.path,
        //         method:route.methods
        //     });
        // });
    }
});


const port = 8000

app.listen(port, (err)=>{
    if (err){
        console.log(err)
    }
    console.log(`app is runnung at ${port}`)
})

