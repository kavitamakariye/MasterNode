/*
*Primary file for the API
*
*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');// The url module splits up a web address into readable parts.
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data')
//TESTING

_data.delete('test','newFile',function(err){
    console.log('this was the error ',err);
    
})
//The server should respond to all the requests with a string

//Instantiate the HTTP server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'), //key for https
    'cert': fs.readFileSync('./https/cert.pem') //certificate for https
}
var httpServer = http.createServer(function (req, res) {
    unifiedServer(req,res);
});

//Start the HTTP server
httpServer.listen(config.httpPort, function () {
    console.log('The server is listening on port '+config.httpPort);
});

//Instantiate the HTTPS server
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
})

//Start the HTTPS server
httpsServer.listen(config.httpsPort,function () {
    console.log('The server is listening on port ' + config.httpsPort);
})

//All the server login for both http and https server
var unifiedServer = function(req,res){

    //Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    //Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //Get the query string as an object
    var queryStringObject = parsedUrl.query;

    //Get the HTTP Method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    //Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        //Chosst the handler this request should go to. If one is not found, use the notFound handler.
        var chosenHandler = typeof (router(trimmedPath)) !== undefined ? router[trimmedPath] : handlers.notFound;

        //Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        }

        //Route the request to the handler specified in the handler
        chosenHandler(data, function (statusCode, payload) {
            //Use the statusCode called by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200 ;

            //Use the payload called by the handler, or default to an empty object.
            payload = typeof(payload) == 'object' ? payload : {};

            //Convert the payload to a String
            var payloadString = JSON.stringify(payload);

            //Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);

            //Send the response
            res.end(payloadString);

            //Log the request path
            console.log('Returning this response:', statusCode, payload);
        });
    });
}

//Define the handlers
var handlers = {};

// ping handler
handlers.ping = function (data, callback) {
    callback('200')
}

//Not found handler
handlers.notFound = function (data, callback) {
    callback('404')
};

//Define a request router
var router = {
    'ping': handlers.ping
};