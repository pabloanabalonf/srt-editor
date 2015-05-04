"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var FileModel = require('../models/file');

//Templates
var templateHome = require('../templates/home.html');
var templateMessage = require('../templates/message-tmpl.html');

//regions
var rm = require('../regions');

var SubtitlesCollection = require('../collections/subtitles');
var SubtitlesCollectionView = require('../views/subtitle-collection-view');

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

$.fn.fixMe = function() {
	return this.each(function() {
		var $this = $(this);
		var $t_fixed;
		function init() {
			$this.wrap('<div class="container" />');
			$t_fixed = $this.clone();
			$t_fixed.find("tbody").remove().end().addClass("fixed").insertBefore($this);
			resizeFixed();
		}
		function resizeFixed() {
			$t_fixed.find("th").each(function(index) {
				$(this).css("width",$this.find("th").eq(index).outerWidth()+"px");
			});
		}
		function scrollFixed() {
			var offset = $(this).scrollTop();
			var tableOffsetTop = $this.offset().top;
			var tableOffsetBottom = tableOffsetTop + $this.height() - $this.find("thead").height();
			if(offset < tableOffsetTop || offset > tableOffsetBottom){
				$t_fixed.hide();
			}else if(offset >= tableOffsetTop && offset <= tableOffsetBottom && $t_fixed.is(":hidden")){
				$t_fixed.show();
			}
		}
		$(window).resize(resizeFixed);
		$(window).scroll(scrollFixed);
		init();
	});
};

var HomeLayoutView = Marionette.LayoutView.extend({
	initialize: function (options){
		this.template = templateHome({});
	},
	template: this.template,
	model: new FileModel(),
	onShow: function (){
		console.log('onShow HomeLayoutView');
	},
	onDestroy: function (){
		console.log('onDestroy HomeLayoutView');
	},
	ui: {
		containerFormLoadSubtitle: '.container-form-load-subtitle',
		containerSubtitles: '.container-subtitles',
		tableSubtitles: '#table-subtitles',
		messageRegion: '#message-region',
		fileName: '#file-name'
	},
	events: {
		"submit #sendSRTFile": "sendSRTFile",
		"click #go-to-top": "gotoTop"
	},
	sendSRTFile: function (e){
		e.preventDefault();
		var $srtFile = $("#uploadFile");
		var reader;
		this.file;
		var that = this;
		var error = false;
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
				error = true;
				break;
			}
		}
		if(error){
			var html = templateMessage({typeAlert: 'danger', message: 'Incorrect file format. You must choose a .srt file.'});
			this.ui.messageRegion.html(html);
			return false;
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
						var subtitlesCollection = new SubtitlesCollection(json.subtitles);
						var subtitlesCollectionView = new SubtitlesCollectionView({
							collection: subtitlesCollection
						});
						that.ui.containerFormLoadSubtitle.hide();
						that.ui.containerSubtitles.show();
						that.ui.fileName.text(that.model.attributes.filename);
						that.ui.tableSubtitles.append(subtitlesCollectionView.render().el);
						that.ui.tableSubtitles.fixMe();
					},
					error: function (model, data){
						that.ui.containerFormLoadSubtitle.show();
						that.ui.containerSubtitles.hide();
						var jsonString = JSON.stringify(data);
						var json = JSON.parse(jsonString);
						var html = templateMessage({typeAlert: 'danger', message: json.responseJSON.message});
						that.ui.messageRegion.html(html);
					}
				});
			});
		}
	},
	gotoTop: function (e){
		$('html, body').animate({
			scrollTop: 0
		},2000);
	}

});

module.exports = HomeLayoutView;