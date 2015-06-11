import { install } from 'source-map-support';
install();

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import errorHandler from 'errorhandler';
import favicon from 'serve-favicon';
import stylus from 'stylus';
import nib from 'nib';

//routes
let home = require('./routes/home');

let app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 3000);

app.use(favicon(path.join(__dirname, '..', 'public', 'img', 'favicon.ico')));
app.use(morgan('common'));
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());
app.use(stylus.middleware({
	src: path.join(__dirname, '..', 'public', 'css'),
	dest: path.join(__dirname, '..', 'public', 'css'),
	compile: function (str, path){
		return stylus(str)
			.set('filename', path)
			.set('compress', true)
			.use(nib())
			.import('nib');
	}
}));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', home);
app.use('/*', (req, res) => {
	res.status(404);
	res.render('404', {title: 'SRT Web Editor | Not Found', status: 404, url: req.baseUrl});
});

app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('error', {
		title: 'SRT Web Editor | Error',
		message: err.message,
		error: err
	});
});

app.listen(app.get('port'), () => {
	console.log(`Express server running in port ${app.get('port')}`);
});