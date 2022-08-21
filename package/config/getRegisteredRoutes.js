const generateDocs = require('../util/generateDocs')

const getRegisteredRoutesTemplete = (app)=>{

    let route, routes = [];
    let tem
    app._router.stack.forEach(function(middleware){
        if(middleware.route){

            // routes registered directly on the app
            const method =Object.keys(middleware.route.methods)[0]
            let path = middleware.route.path
            let paramsArray = middleware.keys
            let params = {}

            if(paramsArray.length>0){
                for(let {name} of paramsArray){
                    params[name] = name
                    path = path.replace(`:${name}`, `{${name}}`);
                }
            }

            let {openAPI} = generateDocs({
                route:path,
                method: method,
                baseUrl:'',
                params
            })

            routes.push({path,method,fullPath:method+middleware.route.path});

            tem = openAPI

        } else if(middleware.name === 'router'){ // router middleware 
        
            let routeregExp = middleware.regexp.toString()
          
            let baseUrl = routeregExp.slice(3,-12).split('\\').join('')   // or routeregExp.match(/\w+[^\\]/ig).join('/')
          
            middleware.handle.stack.forEach(function(handler){
                route = handler.route;

                const method = Object.keys(route.methods)[0]

                let path = handler.route.path
                let paramsArray = handler.keys
                let params = {}

                if(paramsArray.length>0){
                    for(let {name} of paramsArray){
                        params[name] = name
                        path = path.replace(`:${name}`, `{${name}}`);
                    }
                }
            
                if(route){
                    let {openAPI} = generateDocs({
                        route:path,
                        method,
                        baseUrl,
                        params
                    })
                    routes.push({path:baseUrl+path,method,fullPath:method+baseUrl+handler.route.path});
                    tem = openAPI
                }
            });
        }
    });
 return [routes, tem]
}


module.exports = getRegisteredRoutesTemplete 