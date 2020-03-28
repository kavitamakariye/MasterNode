/*
*Helpers for various tasks
*
*/
//Dependencies
var crypto = require('crypto');

//Container for all the helpers

var helpers = {};

//Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    }
}

//Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
}

//Export the module
module.exports = helpers;