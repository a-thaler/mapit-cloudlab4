// Based on https://gist.github.com/jeffdonthemic/87b542cc09864fe203f4
// sudo npm install socket.io
// node app.js

var http = require('http');
var fs = require('fs');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var url = require('url');

let xhr = new XMLHttpRequest();
let lastjson = "notyetset";
let nextjson = "notyetset";
var homepage = fs.readFileSync(__dirname + '/index.html'); // NEVER use a Sync function except at start-up!
var kyma_env = "notyetset"
let orders_endpoint ="notyetset"

// Send index.html to all requests
var app = http.createServer(function(req, res) {
	var q = url.parse(req.url, true).query 
	if (typeof q.kyma_env !== 'undefined' && q.kyma_env )
		kyma_env = q.kyma_env;
	console.log("kyma_env is "+kyma_env)

	orders_endpoint = "https://"+kyma_env+".blissful-jepsen.cluster.extend.sap.cx/orders"
	
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(homepage);

	setInterval( function() { maybeUpdateClients(orders_endpoint); }, 5000 ); 
});

var io = require('socket.io').listen(app);



function maybeUpdateClients(endpoint) {
	console.log("maybeUpdateClients1 "+lastjson+ " "+endpoint)
	xhr.open('GET', endpoint+'?_=' + new Date().getTime(), true);
	xhr.send()

	xhr.onload = function () {
		console.log("maybeUpdateClients2 "+xhr.responseText)
		if (xhr.status >= 200 && xhr.status < 400) {
			nextjson = xhr.responseText;
			if (nextjson!=lastjson) {
				lastjson=nextjson
				console.log("maybeUpdateClients4"+lastjson)
				io.sockets.emit('updatemap', JSON.parse(nextjson) );
			}
		} 
	}
}

// Call maybeUpdateClients periodically
app.listen(3001);
