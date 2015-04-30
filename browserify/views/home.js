"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var templateHome = require('../templates/home.html');
var FileModel = require('../models/file');


$.fn.serializeObject = function (){
	var obj = {};
	var a = this.serializeArray();
	console.log('serializeArray: '+a);
	$.each(a, function (){
		if (obj[this.name] !== undefined){
			console.log('!obj[this.name].push: '+!obj[this.name].push);
			if(!obj[this.name].push){
				obj[this.name] = [obj[this.name]];
			}
			obj[this.name].push(this.value || '');
		}else{
			obj[this.name].push(this.value || '');
		}
	});
	return obj;
};

var HomeLayoutView = Marionette.LayoutView.extend({
	initialize: function (renderData){
		renderData = renderData || {};
		this.template = templateHome(renderData);
	},
	template: this.template,
	model: new FileModel(),
	onShow: function (){
		console.log('onShow HomeLayoutView');
	},
	onDestroy: function (){
		console.log('onDestroy HomeLayoutView');
	},
	events: {
		"submit #sendSRTFile": "sendSRTFile"
	},
	sendSRTFile: function (e){
		e.preventDefault();
		var $srtFile = $("#uploadFile");
		var formData = new FormData();
		var reader;
		this.file;
		var that = this;
		for(var i = 0, len = $srtFile[0].files.length; i < len; i++){
			var file = $srtFile[0].files[i];
			var format = file.name.substr(file.name.length - 4, file.name.length);
			if(format == ".srt"){
				if(window.FileReader){
					reader = new FileReader();
					that.file = file;
					reader.readAsDataURL(file);
				}
			}else{
				console.log("formato incorrecto.");
				break;
			}
		}
		if(this.file){
			this.model.readFile(this.file).then(function (dataFile){
				that.model.set({
					'datafile': dataFile.data,
					'filename': dataFile.file.name,
					'mime': dataFile.file.type
				});
				that.model.save({}, {
					success: function (data){
						var jsonString = JSON.stringify(data);
						var json = JSON.parse(jsonString);
						console.log(JSON.stringify(json.subtitles));
					},
					error: function (model, data){
						console.log(JSON.stringify(model));
						console.log(JSON.stringify(data));
					}
				});
			});
		}
	}

});

module.exports = HomeLayoutView;