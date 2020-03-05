/*
*Primary file for the API
*
*/

//Dependencies
var http = require('http');
var url = require('url');// The url module splits up a web address into readable parts.

//The server should respond to all the requests with a string

var server = http.createServer(function(req, res){

    //Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    //Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    //Get the query string as an object
    var queryStringObject = parsedUrl.query;

    //Get the HTTP Method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    //Send the response
    res.end('Hello World');

    //Log the request path
    console.log('Request received these headers :', headers );
    

    
});
//Start the server, and have it listen on port 3000

server.listen(3000, function(){
    console.log('The server is listening on port 3000 now.');
    
})