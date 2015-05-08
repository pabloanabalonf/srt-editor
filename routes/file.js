var express = require('express');
var router = express.Router();
var async = require('async');
var path = require('path');
var fs = require('fs');

//RegExp
var regSubtitleNumber = new RegExp(/^[0-9]+$/);
var regSubtitleTime = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]\s-->\s(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]$/);

router.post('/api/file', function (req, res){
	try{
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
					objSrt.text = lines[i];
				}else{
					var nextLine = lines[i];
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
	}catch(e){
		return res
			.status(500)
			.json({
				'message': 'Ups! File read error :(',
			});
	}
});

router.post('/api/file/makeSrtFile', function (req, res){
	var data = req.body;
	var pathFile = path.join(__dirname, '..', 'public', data.inputNameFile);
	var stream;
	var existsFile;

	var optionsStream = {
		encoding: 'utf8'
	};
	async.waterfall([
		function checkFileExist(done){
			fs.exists(pathFile, function (exists){
				existsFile = exists;
				done();
			});
		},
		function deleteIfExist(done){
			if(existsFile){
				fs.unlink(pathFile, done);
			}else{
				done();
			}
		},
		function writeFile(done){
			stream = fs.createWriteStream(pathFile, optionsStream);
			stream.once('open', function (fd) {
				for (var i = 0; i < data.subtitles.length; i++){
					stream.write(data.subtitles[i].subtitleNumber+"\n");
					stream.write(data.subtitles[i].startTime+" --> "+data.subtitles[i].finalTime+"\n");

					var textSubtitle = data.subtitles[i].text.split("\\n");
					for(var x = 0; x < textSubtitle.length; x++){
						stream.write(textSubtitle[x]+"\n");
					}
					stream.write("\n");
				}
				stream.end();
			});

			stream.on('finish', function () {
				done();
			});
			stream.on('error', function (err){
				done(err);
			});
		}
	], function (err){
		if(err){
			return res
				.status(500)
				.json({
					'message': "Ups! An error has ocurred. Details: "+err.message
				});
		}
		return res
			.status(200)
			.json({
				'message': "Yay!",
				"link": "/api/file/download/"+data.inputNameFile
			});
	});
});

router.get("/api/file/download/:filename", function (req, res){
	var filename = req.params.filename;
	if(filename === undefined){
		return res.status(404).end();
	}else{
		var pathFile = path.join(__dirname, '..', 'public', filename);

		fs.exists(pathFile, function (exists){
			if(exists){
				res.cookie('DownloadFromSRTWebEditor', true, { maxAge: 60000, path: '/' });
				res.setHeader('Content-disposition', 'attachment; filename=' + filename);
				res.setHeader('Content-type', "application/x-subrip");
				res.download(pathFile, filename, function (err){
					if(err){
						return res.status(500).end();
					}
					fs.unlink(pathFile, function (err){
						if(err){
							console.log('Error at delete file. Details: '+err.message);
						}else{
							console.log('File deleted.');
						}
						
					});
				});
			}else{
				return res.status(404).end();
			}
		});
	}
});

module.exports = router;