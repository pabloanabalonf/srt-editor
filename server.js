var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var stylus = require('stylus');

var app = express();

//ROUTES
var home = require('./routes/home');
var file = require('./routes/file');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', process.env.PORT || 3000);

app.use(morgan('common'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(stylus.middleware({
	src: __dirname + '/public/css',
	dest: __dirname + '/public/css',
	compile: function (str, path){
		return stylus(str)
			.set('filename', path)
			.set('compress', true);
	}
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', home);
app.use('/', file);

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