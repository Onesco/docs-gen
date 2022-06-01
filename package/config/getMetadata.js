const fs = require('fs');
const { dirname } = require("path");
const path = require('path')
const templete =  require("../constants/swaggerTemplete.json")
const getRoutePath = require('../util/getRootPath')


const getMetaData = (...args)=>{
    const {
        title,
        version, 
        description,
        summary,
        termsOfService,
        license,
        contact
    } = args[0]

    let packageFilePath = path.join(getRoutePath(dirname),"package.json")

    if(!title || !version){
        fs.readFile(packageFilePath, (err, file)=>{
            if (err) console.log(err)
            file = JSON.parse(file)
            let {name, version, description} = file
            templete.info.title = name
            templete.info.version = version
            templete.info.description = description
        })
    }else{
        templete.info = {
        ...templete.info,title, version, description,summary,termsOfService,
        license,
        contact
        }
    }
    return templete
}
module.exports = getMetaData