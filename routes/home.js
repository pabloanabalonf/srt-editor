var express = require('express');
var router = express.Router();

router.get('/', function (req, res){
	res.render('index', {title: 'SRT Web Editor'});
});

router.get('/about', function (req, res){
	res.render('about', {title: 'SRT Web Editor'});
});

module.exports = router;