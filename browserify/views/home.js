"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var FileModel = require('../models/file');

//Templates
var templateHome = require('../templates/home.html');
var templateMessage = require('../templates/message-tmpl.html');
var templateActions = require('../templates/actions-subtitles.html')

//regions
var rm = require('../regions');

var SubtitlesCollection = require('../collections/subtitles');
var SubtitlesCollectionView = require('../views/subtitle-collection-view');

$.fn.serializeObject = function (){
	var obj = {};
	var a = this.serializeArray();
	$.each(a, function (){
		if (obj[this.name] !== undefined){
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
		this.IdsInputTable = [];
		this.amountChecked = 0;
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
		actionsRegio: '#subtitle-actions-menu',
		badgeSubtitlesSelected: '#badge-subtitles-selected'
	},
	events: {
		"submit #sendSRTFile": "sendSRTFile",
		"click #go-to-top": "gotoTop",
		'click .chk-subtitle': 'chkSubtitleClicked',
		'click #chkSelectAll': 'chkSelectAllClick'
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
			var html = templateMessage({typeAlert: 'danger', title: "Error!", message: 'Incorrect file format. You must choose a .srt file.'});
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
						//show actions template
						var tmplActions = templateActions({file: that.model.attributes});
						that.ui.actionsRegio.html(tmplActions);
						//load objet subtitles in a collection (and CollectionView)
						var jsonString = JSON.stringify(data);
						var json = JSON.parse(jsonString);
						var subtitlesCollection = new SubtitlesCollection(json.subtitles);
						var subtitlesCollectionView = new SubtitlesCollectionView({
							collection: subtitlesCollection
						});
						//get ids inputs table
						for(var i = 0; i < json.subtitles.length; i++){
							var inputElement = {
								chk: '#chkSubtitle'+ json.subtitles[i].subtitleNumber,
								textNumber: '#txtNumber'+ json.subtitles[i].subtitleNumber,
								textStart: '#txtStartTime'+ json.subtitles[i].subtitleNumber,
								textFinal: '#txtFinalTime'+ json.subtitles[i].subtitleNumber,
								textArea: '#txtSubtitleText'+ json.subtitles[i].subtitleNumber,
							};
							that.IdsInputTable.push(inputElement);
						}

						//hide form load subtitle
						that.ui.containerFormLoadSubtitle.hide();
						//show subtitle container
						that.ui.containerSubtitles.show();
						that.ui.tableSubtitles.append(subtitlesCollectionView.render().el);
						that.ui.tableSubtitles.fixMe();
					},
					error: function (model, data){
						that.ui.containerFormLoadSubtitle.show();
						that.ui.containerSubtitles.hide();
						var jsonString = JSON.stringify(data);
						var json = JSON.parse(jsonString);
						var html = templateMessage({typeAlert: 'danger', title:"Error!", message: json.responseJSON.message});
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
	},
	chkSubtitleClicked: function (e){
		var idChk =  '#'+ e.target.id;
		if($(idChk).is(':checked')){
			$(idChk).closest("tr").addClass('success');
			this.amountChecked++;
		}else{
			$(idChk).closest("tr").removeClass('success');
			if($('#chkSelectAll').is(':checked')){
				$('#chkSelectAll').prop('checked', false);
			}
			this.amountChecked--;
		}

		if(this.amountChecked == this.IdsInputTable.length){
			$('#chkSelectAll').prop('checked', true);
		}

		this.ui.badgeSubtitlesSelected.text(this.amountChecked);

	},
	chkSelectAllClick: function (e){
		var idChk =  '#'+ e.target.id;
		var isChecked = $(idChk).is(':checked');

		if(isChecked){
			this.amountChecked = this.IdsInputTable.length;
		}else{
			this.amountChecked = 0;
		}

		for(var i = 0; i < this.IdsInputTable.length; i++){
			if(isChecked){
				if(!$(this.IdsInputTable[i].chk).is(':checked')){
					$(this.IdsInputTable[i].chk).closest("tr").addClass('success');
					$(this.IdsInputTable[i].chk).prop('checked', true);
				}
			}else{
				$(this.IdsInputTable[i].chk).prop('checked', false);
				$(this.IdsInputTable[i].chk).closest("tr").removeClass('success');
			}
		}

		this.ui.badgeSubtitlesSelected.text(this.amountChecked);
	}

});

module.exports = HomeLayoutView;