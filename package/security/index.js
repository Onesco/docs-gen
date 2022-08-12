const apiKeyScheme = require('./apiKey')
const Oauth2Scheme = require('./Oauth2')
const httpSecurityScheme = require('./http')


module.exports = {
    httpSecurityScheme,
    Oauth2Scheme,
    apiKeyScheme
}