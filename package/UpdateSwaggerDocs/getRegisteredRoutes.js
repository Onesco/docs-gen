const getRegisteredRoutes = (app)=>{

    let route, routes = [];
    app._router.stack.forEach(function(middleware){
        if(middleware.route){ // routes registered directly on the app
            routes.push({
                path:middleware.route.path,
                method: Object.keys(middleware.route.methods)[0]
            });
        } else if(middleware.name === 'router'){ // router middleware 
        
            let routeregExp = middleware.regexp.toString()
            // routeregExp.match(/\w+[^\\]/ig).join('/')
            let baseUrl = routeregExp.slice(3,-12).split('\\').join('')

            middleware.handle.stack.forEach(function(handler){
                route = handler.route;
                route && routes.push({
                    path:baseUrl+route.path,
                    method:Object.keys(route.methods)[0]
                });
            });
        }
    });
 return routes
}

module.exports = getRegisteredRoutes 