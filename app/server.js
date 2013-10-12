var express = require('express');
var path = require('path');
var hbs = require('hbs');
var fs = require('fs');

var data = require('./shared/Data').Data;

data.setMain(require('../data/main.json'));

var serverRoot = process.argv[2];

if(!serverRoot || serverRoot == "") {
	console.log("Server root not provided, defaulting to ./");
	serverRoot = "./";
}

var context = {
	imports: require('../data/imports.json'),
	data: data.getMain()
};

var config = {
	noscript: false,
	dev: true
};

var hbsHelper = function(c, key) {
	hbs.registerHelper(key, function(options) {

		if(key == "dev") console.log("Helper invoked", c[key], key);

		if(c[key]) {
			if(key == "dev") console.log("Dev is true");
			return options.fn(this);
		} else {
			if(key == "dev") console.log("Dev is false");
			return options.inverse(this);
		}
	});
};

hbsHelper(config, "noscript");
hbsHelper(config, "dev");


var app = express();

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.static('static'));

var renderIndex = function(response) {
	response.render('index', context);
}

// Content routes
app.get('/', function(request, response) {
	if(!!request.query.dev) config.dev = (request.query.dev == "false") ? false : true;
	else config.dev = true;

	console.log("config.dev", config.dev);

	config.noscript = false;
	renderIndex(response);
});

app.get('/about', function(request, response) {
	renderIndex(response);
});

app.get('/project/:name', function(request, response) {
	if(config.noscript) {
		var p = path.resolve(serverRoot + 'data/items/' + request.params.name + '.html');
		
		fs.readFile(p, function (err, fileContent) {
		  if (err) throw err;
		  response.render('project', { 
		  	content: fileContent, 
		  	item: data.getProjectById(request.params.name) 
		  });
		});
	} else {
		renderIndex(response);
	}
});

// Special routes
app.get('/noscript', function(request, response) {
	config.noscript = true;
	renderIndex(response);
});

// Data routes
app.get('/data', function(request, response) {
	response.send(data.getMain());
});

app.get('/context', function(request, response) {
	response.send(context);
});

app.get('/data/:name', function(request, response) {
	var p = path.resolve(serverRoot + 'data/items/' + request.params.name + '.html');
	response.sendfile(p);
});

app.get('/shared/:name', function(request, response) {
	var p = path.resolve(serverRoot + 'app/shared/' + request.params.name);
	response.sendfile(p);
});

app.listen(3123);














