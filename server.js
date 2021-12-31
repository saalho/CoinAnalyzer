/*
File: server.js
Author: Saara Alho
Created: 30.12.2021
Description: A simple node.js server to run the application in browser.
*/
var http = require('http');
var https = require('https');
var fs = require('fs').promises;

const host = 'localhost';
const port = 5000;

const htmlFilepath = './index.html';

const reqListener = function (req, res) {
	if (req.url == "/"){
		fs.readFile(htmlFilepath)
			.then(content => {
				res.setHeader("Content-Type", "application");
				res.writeHead(200);
				res.end(content);
		});
	}
	else if (req.url == "/style.css"){
		fs.readFile("./style.css")
		.then(content => {
			res.setHeader("Content-Type","text/css");
			res.writeHead(200);
			res.end(content);
		});
	}
	else if (req.url == "/functionality.js"){
		fs.readFile("./functionality.js")
		.then(content => {
			res.setHeader("Content-Type","text/javascript");
			res.writeHead(200);
			res.end(content);
		});
	}
	else {
		res.writeHead(404, {"Content-Type":"text/plain"});
		res.write("Page does not exist");
	}
};
var server = http.createServer(reqListener);

server.listen(port, host, () =>{
	console.log(`Server is running at ${host}:${port}`);
});

