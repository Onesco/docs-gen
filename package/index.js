
const {config, setAppAndDocsPath} = require('./config/setting')
const getAuthorizationHeader = require("./security/util")
const {validator} = require("./valdocs")



// module.exports = {
//     config,
//     validator,
//     getAuthorizationHeader,
// }

class valdocs extends validator{
    constructor(options) {
        config(options)
    } 
}

module.exports = valdocs