var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var errorhandler = require('errorhandler');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || 3000);

app.use(morgan('common'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', function (req, res){
	res.render('index', {title: 'SRT Editor'});
});

app.use('/*', function(req, res, next){
	res.render('404', { status: 404, url: req.url });
});

app.use(errorhandler());
app.use(function (err, req, res, next){
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
});

app.listen(app.get('port'), function (){
	console.log('Express server running in port '+app.get('port'));
});