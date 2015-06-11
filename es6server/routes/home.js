import express from 'express';
let router = express.Router();

router.get('/', (req, res) => {
	res.render('index', {title: 'SRT Web Editor'});
});

router.get('/about', (req, res) => {
	res.render('about', {title: 'SRT Web Editor'});
});

export default router;