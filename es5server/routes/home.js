'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var router = _express2['default'].Router();

router.get('/', function (req, res) {
	res.render('index', { title: 'SRT Web Editor' });
});

router.get('/about', function (req, res) {
	res.render('about', { title: 'SRT Web Editor' });
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=../routes/home.js.map