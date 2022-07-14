const generateDocs = require('../util/generateDocs')

const getRegisteredRoutesTemplete = (app)=>{
    let routesObjs = {}
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

            if(!routesObjs[path]){
                routesObjs[path] = new Set([method])
            }
            else{
                routesObjs[path].add(method)
            }

            
            let {openAPI, operationId} = generateDocs({
                route:path,
                method: method,
                baseUrl:'',
                params
            })
            routes.push(operationId);
            tem = openAPI

        } else if(middleware.name === 'router'){ // router middleware 
        
            let routeregExp = middleware.regexp.toString()
            // routeregExp.match(/\w+[^\\]/ig).join('/')
            let baseUrl = routeregExp.slice(3,-12).split('\\').join('')
          
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
                
                if(!routesObjs[baseUrl+path]){
                    routesObjs[baseUrl+path] = new Set([method])
                }
                else{
                    routesObjs[baseUrl+path].add(method)
                }

                if(route){
                    let {openAPI, operationId} = generateDocs({
                        route:path,
                        method,
                        baseUrl,
                        params
                    })
                    routes.push(operationId);
                    tem = openAPI
                }
            });
        }
    });
 return [routes, tem,  routesObjs]
}


module.exports = getRegisteredRoutesTemplete 