var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var favicon = require('serve-favicon');
var stylus = require('stylus');
var nib = require('nib');

var app = express();

//ROUTES
var home = require('./routes/home');
var file = require('./routes/file');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || 3000);

app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(morgan('common'));
app.use(bodyParser.json({limit: '500mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());
app.use(stylus.middleware({
	src: __dirname + '/public/css',
	dest: __dirname + '/public/css',
	compile: function (str, path){
		return stylus(str)
			.set('filename', path)
			.set('compress', true)
			.use(nib())
			.import('nib');
	}
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/', file);
app.use('/*', function (req, res){
	res.status(404);
	res.render('404', {title: 'SRT Web Editor | Not Found', status: 404, url: req.baseUrl});
});

//app.use(errorhandler());
app.use(function (err, req, res, next){
	res.status(err.status || 500);
	res.render('error', {
		title: 'SRT Web Editor | Error',
		message: err.message,
		error: err
	});
});

app.listen(app.get('port'), function (){
	console.log('Express server running in port '+app.get('port'));
});