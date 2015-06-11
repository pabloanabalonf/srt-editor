import express from 'express';
import async from 'async';
import path from 'path';
import fs from 'fs';
import iconv from 'iconv-lite';

let router = express.Router();

const regSubtitleNumber = new RegExp(/^[0-9]+$/);
const regSubtitleTime = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]\s-->\s(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]$/);

let getArr = (str) => {
	let nIndex = 0;
	let nLen = str.length;
	let arr = [];
	for(; nIndex < nLen; nIndex++){
		arr.push(str.charCodeAt(nIndex));
	}
	return arr;
};

router.post('/api/file', (req, res) => {
	try{
		let data = req.body;
		let buf = new Buffer(data.datafile, 'base64');
		let srtString = iconv.decode(buf, "ISO-8859-1");
		let lines = srtString.split(/\r\n|\r|\n/g);
		let objSrt = {};
		let arraySrt = [];
		for(let i = 0; i < lines.length; i++){
			if(regSubtitleNumber.test(lines[i])){
				objSrt.subtitleNumber = lines[i];
			}else if(regSubtitleTime.test(lines[i])){
				let times = lines[i].split('-->');
				objSrt.startTime = times[0].trim();
				objSrt.finalTime = times[1].trim();
			}else if(lines[i].length > 0){
				if(objSrt.text === undefined){
					objSrt.text = lines[i];
				}else{
					let nextLine = lines[i];
					objSrt.text += "\n"+nextLine;
				}
			}else{
				if(objSrt.subtitleNumber && objSrt.startTime && objSrt.finalTime && objSrt.text){
					arraySrt.push(objSrt);
				}
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
		console.log('Error: '+e.message);
		return res
			.status(500)
			.json({
				'message': 'Ups! File read error :(',
			});
	}
});

router.post('/api/file/makeSrtFile', (req, res) => {
	let data = req.body;
	let pathFile = path.join(__dirname, '..', '..', 'public', 'srt-files', data.inputNameFile);
	let stream;
	let existsFile;
	let buf = new Buffer(data.subtitles, 'base64');
	let srtString = iconv.decode(buf, "ISO-8859-1");
	let json = JSON.parse(srtString);
	data.subtitles = json;
	//validations
	if(!data.inputNameFile || !data.inputEncoding || !data.subtitles){
		return res
			.status(401)
			.json({
				'message': "Data doesn't send correctly."
			});
	}

	if(!(/^.*\.(srt|SRT)$/).test(data.inputNameFile)){
		return res
			.status(401)
			.json({
				'message': "Incorrect file name."
			});
	}

	if(['utf8', 'utf16le', 'ascii'].indexOf(data.inputEncoding) == -1){
		return res
			.status(401)
			.json({
				'message': "Incorrect encoding type."
			});
	}
	let validationError = false;
	for (let i = 0; i < data.subtitles.length; i++){
		if(!data.subtitles[i].subtitleNumber){
			validationError = true;
			break;
		}
		if(!data.subtitles[i].startTime){
			validationError = true;
			break;
		}
		if(!data.subtitles[i].finalTime){
			validationError = true;
			break;
		}
		if(!data.subtitles[i].text){
			validationError = true;
			break;
		}
	}

	if(validationError){
		return res
			.status(401)
			.json({
				'message': "Subtitles data doesn't send correctly."
			});
	}

	let optionsStream = {
		encoding: data.inputEncoding
	};

	/*FUNCTIONS*/
	
	async.waterfall([
		function checkFileExist(done) {
			fs.exists(pathFile, function (exists){
				existsFile = exists;
				done();
			});
		},
		function deleteIfExist(done) {
			if(existsFile){
				fs.unlink(pathFile, done);
			}else{
				done();
			}
		},
		function writeFile(done) {
			stream = fs.createWriteStream(pathFile, optionsStream);
			stream.once('open', (fd) => {
				for (let i = 0; i < data.subtitles.length; i++){
					stream.write(data.subtitles[i].subtitleNumber+"\n");
					stream.write(data.subtitles[i].startTime+" --> "+data.subtitles[i].finalTime+"\n");

					let textSubtitle = data.subtitles[i].text.split("\\n");
					for(let x = 0; x < textSubtitle.length; x++){
						stream.write(textSubtitle[x]+"\n");
					}
					stream.write("\n");
				}
				stream.end();
			});

			stream.on('finish', () => {
				done();
			});
			stream.on('error', (err) => {
				done(err);
			});
		}
	], (err) => {
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

router.get("/api/file/download/:filename", (req, res) => {
	let filename = req.params.filename;
	if(filename === undefined){
		return res.status(404).end();
	}else{
		let pathFile = path.join(__dirname, '..', '..', 'public', 'srt-files', filename);

		fs.exists(pathFile, (exists) => {
			if(exists){
				res.cookie('DownloadFromSRTWebEditor', true, { maxAge: 60000, path: '/' });
				res.setHeader('Content-disposition', 'attachment; filename=' + filename);
				res.setHeader('Content-type', "application/x-subrip");
				res.download(pathFile, filename, (err) => {
					if(err){
						return res.status(500).end();
					}
					fs.unlink(pathFile, (err) => {
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

export default router;