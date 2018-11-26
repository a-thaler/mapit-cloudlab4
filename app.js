// Based on https://gist.github.com/jeffdonthemic/87b542cc09864fe203f4
// This usually runs in a Docker container 
// 
// To run locally you need to have npm and run
// npm install xmlhttprequest socket.io app.js
// Then
// node app.js
// and access
// localhost:3001/?<coolEnvironmentName>/<kymaClusterName> 

var http = require('http');
var fs = require('fs');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var url = require('url');
var _ = require('underscore');

let xhr = new XMLHttpRequest();
let nextjson = "notyetset";
var homepage = fs.readFileSync(__dirname + '/index.html'); // NEVER use a Sync function except at start-up!
let kyma_env = "notyetset"
let orders_endpoint ="notyetset"


var app = http.createServer(function(req, res) {
	// Get kyma_env from URL
	var q = url.parse(req.url, true).query 
	if (typeof q.kyma_env !== 'undefined' && q.kyma_env )
		kyma_env = q.kyma_env;
	console.log("kyma_env "+kyma_env)

	if (typeof q.kyma_cluster !== 'undefined' && q.kyma_cluster )
		kyma_cluster = q.kyma_cluster;
	console.log("kyma_cluster "+kyma_cluster)

	orders_endpoint = "https://"+kyma_env+"."+kyma_cluster+".cluster.extend.sap.cx/orders"	
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(homepage);

	// Periodically call updateClients
	setInterval( function() { updateClients(orders_endpoint); }, 5000 ); 
});

var io = require('socket.io').listen(app);

function updateClients(endpoint) {
	xhr.open('GET', endpoint+'?_=' + new Date().getTime(), true); // To prevent caching
	xhr.send()
	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status < 400) {
			nextjson = xhr.responseText;
			console.log("updatemap")
			io.sockets.emit('updatemap', JSON.parse(nextjson) );
		} else 
		{			
			console.log("Error status "+xhr.status )
		} 
	}
	xhr.onerror= function(e) {
        console.log("Error fetching " + endpoint);
    };
}

app.listen(3001);