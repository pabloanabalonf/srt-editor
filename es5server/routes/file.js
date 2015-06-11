'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _iconvLite = require('iconv-lite');

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var router = _express2['default'].Router();

var regSubtitleNumber = new RegExp(/^[0-9]+$/);
var regSubtitleTime = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]\s-->\s(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]$/);

var getArr = function getArr(str) {
	var nIndex = 0;
	var nLen = str.length;
	var arr = [];
	for (; nIndex < nLen; nIndex++) {
		arr.push(str.charCodeAt(nIndex));
	}
	return arr;
};

router.post('/api/file', function (req, res) {
	try {
		var data = req.body;
		var buf = new Buffer(data.datafile, 'base64');
		var srtString = _iconvLite2['default'].decode(buf, 'ISO-8859-1');
		var lines = srtString.split(/\r\n|\r|\n/g);
		var objSrt = {};
		var arraySrt = [];
		for (var i = 0; i < lines.length; i++) {
			if (regSubtitleNumber.test(lines[i])) {
				objSrt.subtitleNumber = lines[i];
			} else if (regSubtitleTime.test(lines[i])) {
				var times = lines[i].split('-->');
				objSrt.startTime = times[0].trim();
				objSrt.finalTime = times[1].trim();
			} else if (lines[i].length > 0) {
				if (objSrt.text === undefined) {
					objSrt.text = lines[i];
				} else {
					var nextLine = lines[i];
					objSrt.text += '\n' + nextLine;
				}
			} else {
				if (objSrt.subtitleNumber && objSrt.startTime && objSrt.finalTime && objSrt.text) {
					arraySrt.push(objSrt);
				}
				objSrt = {};
			}
		}

		return res.status(200).json({
			'subtitles': arraySrt,
			'message': 'OK'
		});
	} catch (e) {
		console.log('Error: ' + e.message);
		return res.status(500).json({
			'message': 'Ups! File read error :('
		});
	}
});

router.post('/api/file/makeSrtFile', function (req, res) {
	var data = req.body;
	var pathFile = _path2['default'].join(__dirname, '..', '..', 'public', 'srt-files', data.inputNameFile);
	var stream = undefined;
	var existsFile = undefined;
	var buf = new Buffer(data.subtitles, 'base64');
	var srtString = _iconvLite2['default'].decode(buf, 'ISO-8859-1');
	var json = JSON.parse(srtString);
	data.subtitles = json;
	//validations
	if (!data.inputNameFile || !data.inputEncoding || !data.subtitles) {
		return res.status(401).json({
			'message': 'Data doesn\'t send correctly.'
		});
	}

	if (!/^.*\.(srt|SRT)$/.test(data.inputNameFile)) {
		return res.status(401).json({
			'message': 'Incorrect file name.'
		});
	}

	if (['utf8', 'utf16le', 'ascii'].indexOf(data.inputEncoding) == -1) {
		return res.status(401).json({
			'message': 'Incorrect encoding type.'
		});
	}
	var validationError = false;
	for (var i = 0; i < data.subtitles.length; i++) {
		if (!data.subtitles[i].subtitleNumber) {
			validationError = true;
			break;
		}
		if (!data.subtitles[i].startTime) {
			validationError = true;
			break;
		}
		if (!data.subtitles[i].finalTime) {
			validationError = true;
			break;
		}
		if (!data.subtitles[i].text) {
			validationError = true;
			break;
		}
	}

	if (validationError) {
		return res.status(401).json({
			'message': 'Subtitles data doesn\'t send correctly.'
		});
	}

	var optionsStream = {
		encoding: data.inputEncoding
	};

	/*FUNCTIONS*/

	_async2['default'].waterfall([function checkFileExist(done) {
		_fs2['default'].exists(pathFile, function (exists) {
			existsFile = exists;
			done();
		});
	}, function deleteIfExist(done) {
		if (existsFile) {
			_fs2['default'].unlink(pathFile, done);
		} else {
			done();
		}
	}, function writeFile(done) {
		stream = _fs2['default'].createWriteStream(pathFile, optionsStream);
		stream.once('open', function (fd) {
			for (var i = 0; i < data.subtitles.length; i++) {
				stream.write(data.subtitles[i].subtitleNumber + '\n');
				stream.write(data.subtitles[i].startTime + ' --> ' + data.subtitles[i].finalTime + '\n');

				var textSubtitle = data.subtitles[i].text.split('\\n');
				for (var x = 0; x < textSubtitle.length; x++) {
					stream.write(textSubtitle[x] + '\n');
				}
				stream.write('\n');
			}
			stream.end();
		});

		stream.on('finish', function () {
			done();
		});
		stream.on('error', function (err) {
			done(err);
		});
	}], function (err) {
		if (err) {
			return res.status(500).json({
				'message': 'Ups! An error has ocurred. Details: ' + err.message
			});
		}
		return res.status(200).json({
			'message': 'Yay!',
			'link': '/api/file/download/' + data.inputNameFile
		});
	});
});

router.get('/api/file/download/:filename', function (req, res) {
	var filename = req.params.filename;
	if (filename === undefined) {
		return res.status(404).end();
	} else {
		(function () {
			var pathFile = _path2['default'].join(__dirname, '..', '..', 'public', 'srt-files', filename);

			_fs2['default'].exists(pathFile, function (exists) {
				if (exists) {
					res.cookie('DownloadFromSRTWebEditor', true, { maxAge: 60000, path: '/' });
					res.setHeader('Content-disposition', 'attachment; filename=' + filename);
					res.setHeader('Content-type', 'application/x-subrip');
					res.download(pathFile, filename, function (err) {
						if (err) {
							return res.status(500).end();
						}
						_fs2['default'].unlink(pathFile, function (err) {
							if (err) {
								console.log('Error at delete file. Details: ' + err.message);
							} else {
								console.log('File deleted.');
							}
						});
					});
				} else {
					return res.status(404).end();
				}
			});
		})();
	}
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=../routes/file.js.map