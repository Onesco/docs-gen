
// console.log(...app._router.stack)
// console.log(...router.stack)
//////////////
let route, routes = [];

app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        routes.push({
            path:middleware.route.path,
            method: middleware.route.methods
        });
    } else if(middleware.name === 'router'){ // router middleware 
        console.log(middleware)
        middleware.handle.stack.forEach(function(handler){
            route = handler.route;
            route && routes.push({
                path:route.path,
                method:route.methods
            });
        });
    }
});

// console.log(routes)