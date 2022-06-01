

const getRoutePath = (dirname)=> dirname(require.main.fiename 
    || process.mainModule.filename)

module.exports = getRoutePath