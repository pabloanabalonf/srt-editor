var fs = require('fs');
var async = require('async');
var pathFile = "/Users/pabloanabalon/Documents/workspace/srt-editor/public/2 - 1 - Dynamic Connectivity (10-22).srt";
var existsFile;
async.waterfall([
	function checkFileExist(cb){
		console.log('checkFileExist');
		fs.exists(pathFile, function (exists){
			existsFile = exists;
			cb();
		});
	},
	function deleteIfExist(cb){
		console.log('deleteIfExist');
		console.log('exists: '+existsFile);
		if(existsFile){
			fs.unlink(pathFile, cb);
		}else{
			cb();
		}
	}
], function (err){
	if(err){
		console.log("error");
	}else{
		console.log("finish");
	}

});