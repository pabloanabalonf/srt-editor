var express = require('express');
var router = express.Router();
var async = require('async');

//RegExp
var regSubtitleNumber = new RegExp(/^[0-9]+$/);
var regSubtitleTime = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]\s-->\s(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]$/);

router.post('/api/file', function (req, res){
	var data = req.body;
	var buf = new Buffer(data.datafile, 'base64');
	var srtString = buf.toString('utf8');
	var lines = srtString.split(/\r\n|\r|\n/g);
	var objSrt = {};
	var arraySrt = [];
	for(var i = 0; i < lines.length; i++){
		if(regSubtitleNumber.test(lines[i])){
			objSrt.subtitleNumber = lines[i];
		}else if(regSubtitleTime.test(lines[i])){
			var times = lines[i].split('-->');
			objSrt.startTime = times[0].trim();
			objSrt.finalTime = times[1].trim();
		}else if(lines[i].length > 0){
			if(objSrt.text === undefined){
				objSrt.text = lines[i].replace("\\", '');
			}else{
				var nextLine = lines[i].replace("\\", '');
				objSrt.text += "\n"+nextLine;
			}
		}else{
			arraySrt.push(objSrt);
			objSrt = {};
		}
	}

	return res
		.status(200)
		.json({
			'subtitles': arraySrt,
			'message': 'OK',
		});
});

module.exports = router;