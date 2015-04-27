var http = require('http');
var https = require('https');
var sys = require('sys');
var fs = require('fs');
var xml2js = require('xml2js');


var index = fs.readFileSync('index.html');

http.createServer(server).listen(8080);

function server(request, response) {
    
    if (request.url === '/') {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        console.log(index.toString());
        response.end(index, 'utf-8');
        
    }
    
    var login = 'i_komsa';
    var password = 'k8ubbhe@ds';
    var userpass = new Buffer(login + ':' + password).toString('base64');
    
    var options = {
        host: "teamcity.wargaming.net",
        path: request.url,
        headers: {
            'Authorization': 'Basic ' + userpass
        }
    };
    
    var proxyRequest = https.get(options);
    var proxyResponseBody = "";
    proxyRequest.addListener('response', respond);
    
    function respond(proxyResponse) {
        
        response.writeHead(proxyResponse.statusCode);
        
        
        proxyResponse.addListener('data', function (chunk) {
            proxyResponseBody += chunk;
        });
        
        proxyResponse.addListener('end', sendJson);
    }    ;
    
    function sendJson() {
        
        var parser = new xml2js.Parser({
            ignoreAttrs: false,
            mergeAttrs: true,
            explicitArray: false
        });
        
        parser.parseString(proxyResponseBody, function (error, result) {
            var data = {
                body: result
            };
            
            response.end(JSON.stringify(data));
        });
    }
}