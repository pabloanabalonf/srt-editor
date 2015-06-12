'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _sourceMapSupport = require('source-map-support');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

(0, _sourceMapSupport.install)();

//routes
var home = require('./routes/home');
var file = require('./routes/file');

var app = (0, _express2['default'])();

app.set('views', _path2['default'].join(__dirname, '..', 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);

app.use((0, _serveFavicon2['default'])(_path2['default'].join(__dirname, '..', 'public', 'img', 'favicon.ico')));
app.use((0, _morgan2['default'])('common'));
app.use(_bodyParser2['default'].json({ limit: '50mb', type: 'application/json' }));
app.use(_bodyParser2['default'].urlencoded({ extended: true, limit: '50mb' }));
app.use((0, _cookieParser2['default'])());
app.use(_stylus2['default'].middleware({
	src: _path2['default'].join(__dirname, '..', 'public', 'css'),
	dest: _path2['default'].join(__dirname, '..', 'public', 'css'),
	compile: function compile(str, path) {
		return (0, _stylus2['default'])(str).set('filename', path).set('compress', true).use((0, _nib2['default'])())['import']('nib');
	}
}));
app.use(_express2['default']['static'](_path2['default'].join(__dirname, '..', 'public')));

app.use('/', home);
app.use('/', file);
app.use('/*', function (req, res) {
	res.status(404);
	res.render('404', { title: 'SRT Web Editor | Not Found', status: 404, url: req.baseUrl });
});

app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		title: 'SRT Web Editor | Error',
		message: err.message,
		error: err
	});
});

app.listen(app.get('port'), function () {
	console.log('Express server running in port ' + app.get('port'));
});
//# sourceMappingURL=server.js.map