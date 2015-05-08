"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
var moment = require('moment');
var FileModel = require('../models/file');

//Templates
var templateHome = require('../templates/home.html');
var templateMessage = require('../templates/message-tmpl.html');
var templateActions = require('../templates/actions-subtitles.html')

//regions
var rm = require('../regions');

var SubtitlesCollection = require('../collections/subtitles');
var SubtitlesCollectionView = require('../views/subtitle-collection-view');

/*
, = 44
0 = 48
1 = 49
2 = 50
3 = 51
4 = 52
5 = 53
6 = 54
7 = 55
8 = 56
9 = 57
: = 58
*/

var keyAllows = [44, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];

//regex validation
var validateNumberSubtitle = new RegExp(/^[0-9]+$/);
var validateDelayMode = new RegExp(/^\+|\-$/);
var validateDelayInput = new RegExp(/^[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]$/);
var validateTimes = new RegExp(/^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9],[0-9][0-9][0-9]$/);

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
			obj[this.name] = this.value || '';
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
		'click #chkSelectAll': 'chkSelectAllClick',
		//Form events
		'submit #setDelayForm': 'setDelayForm',
		'submit #saveSrtFileForm': 'saveSrtFileForm',
		'keypress #inputDelay': 'keysInInputDelay',
		'keypress .input-start-time': 'keysInInputDelay',
		'keypress .input-final-time': 'keysInInputDelay',
		'focusout .input-start-time': 'validateTimeInput',
		'focusout .input-final-time': 'validateTimeInput',
		'focusout .input-subtitle-text': 'validateSubtitleText',
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
	},
	setDelayForm: function (e){
		e.preventDefault();
		$("#error-actions").html('');
		$('#inputDelay').closest('div').removeClass('has-error');
		var data = $(e.currentTarget).serializeObject();
		if(!validateDelayInput.test(data.inputDelay)){
			$('#inputDelay').closest('div').addClass('has-error');
			var html = templateMessage({typeAlert: 'danger', title:"Error!", message: "Delay not set correctly. Remember <strong>MM:SS:mmmm</strong>."});
			$("#error-actions").html(html);
			return false;
		}
		
		if(!validateDelayMode.test(data.inputDelayMode)){
			$('#inputDelay').closest('div').addClass('has-error');
			var html = templateMessage({typeAlert: 'danger', title: "Error!", message: "Delay type must be + or -"});
			$("#error-actions").html(html);
			return false;
		}
		/*
		how to set delay
		var start = moment("01:02:05,021","HH:mm:ss SSS")
		var time_reduct = moment("00:00:06,000","HH:mm:ss SSS")
		//substract milliseconds
		start.subtract(time_reduct.millisecond(), 'milliseconds');
		//substract seconds
		start.subtract(time_reduct.seconds(), 'seconds');
		//substact minutes
		start.subtract(time_reduct.minutes(), 'minutes');
		moment(new Date(start)).format("HH:mm:ss SSS") //return '01:01:59 021'
		*/

	},
	saveSrtFileForm: function (e){
		e.preventDefault();
		console.log('saveSrtFileForm');
		var data = $(e.currentTarget).serializeObject();

		console.log('data'+JSON.stringify(data));
	},
	keysInInputDelay: function (e){
		if(keyAllows.indexOf(e.keyCode) == -1){
			e.preventDefault();
		}
	},
	validateTimeInput: function (e){
		var inputValue = $(e.currentTarget).val();
		if(!validateTimes.test(inputValue)){
			$(e.currentTarget).closest('div').addClass('has-error');
		}else{
			$(e.currentTarget).closest('div').removeClass('has-error');
		}
	},
	validateSubtitleText: function (e){
		var textAreaValue = $(e.currentTarget).val().trim();
		if(textAreaValue.length == 0){
			$(e.currentTarget).closest('td').addClass('has-error');
		}else{
			$(e.currentTarget).closest('td').removeClass('has-error');
		}
	}

});

module.exports = HomeLayoutView;