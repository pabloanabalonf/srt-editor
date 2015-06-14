import $ from '../jquery.and.fileDownload';
import Backbone from 'backbone';
Backbone.$ = $;
import JSONC from 'jsoncomp';
import gzip from 'gzip-js';
import Marionette from 'backbone.marionette';
import moment from 'moment';
import FileModel from '../models/file';

//Templates
import templateHome from '../templates/home.html';
import templateMessage from '../templates/message-tmpl.html';
import templateActions from '../templates/actions-subtitles.html';

//regions
import rm from '../regions';

import SubtitlesCollection from '../collections/subtitles';
import SubtitlesCollectionView from '../views/subtitle-collection-view';

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
var encodingAllows = ['utf8', 'utf16le', 'ascii'];

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

function arrayObjectIndexOf(myArray, searchTerm, property) {
	for(var i = 0, len = myArray.length; i < len; i++) {
		if (myArray[i][property] === searchTerm) return i;
	}
	return -1;
}

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

let HomeLayoutView = Marionette.LayoutView.extend({
	initialize: function (options){
		this.template = templateHome({});
		this.IdsInputTable = [];
		this.amountChecked = 0;
		this.countTimeErrors = 0;
		this.countSubtitleTextErrors = 0;
		this.model = new FileModel();
		$('.loading').hide();
	},
	model: new FileModel(),
	onShow: function (){
	},
	onDestroy: function (){
	},
	ui: {
		containerFormLoadSubtitle: '.container-form-load-subtitle',
		containerSubtitles: '.container-subtitles',
		tableSubtitles: '#table-subtitles',
		messageRegion: '#message-region',
		actionsRegio: '#subtitle-actions-menu',
		badgeSubtitlesSelected: '#badge-subtitles-selected',
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
		$('.loading').show();
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
			$('.loading').hide();
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
								subtitleNumber: json.subtitles[i].subtitleNumber,
								isSelected: false
							};
							that.IdsInputTable.push(inputElement);
						}

						//hide form load subtitle
						that.ui.containerFormLoadSubtitle.hide();
						//show subtitle container
						that.ui.containerSubtitles.show();
						that.ui.tableSubtitles.append(subtitlesCollectionView.render().el);
						that.ui.tableSubtitles.fixMe();
						//hide loading
						$('.loading').hide();
					},
					error: function (model, data){
						that.ui.containerFormLoadSubtitle.show();
						that.ui.containerSubtitles.hide();
						var jsonString = JSON.stringify(data);
						var json = JSON.parse(jsonString);
						var html = templateMessage({typeAlert: 'danger', title:"Error!", message: json.responseJSON.message});
						that.ui.messageRegion.html(html);
						//hide loading
						$('.loading').hide();
					}
				});
			});
		}else{
			$('.loading').hide();
		}
	},
	gotoTop: function (e){
		$('html, body').animate({
			scrollTop: 0
		},2000);
	},
	chkSubtitleClicked: function (e){
		var idChk =  '#'+ e.target.id;
		var index;

		if(Array.prototype.map !== undefined){
			index = this.IdsInputTable.map(function (e) { return e.chk; }).indexOf(idChk);
		}else{
			index = arrayObjectIndexOf(this.IdsInputTable, idChk, "chk");
		}

		if($(idChk).is(':checked')){
			$(idChk).closest("tr").addClass('success');
			this.amountChecked++;
			this.IdsInputTable[index].isSelected = true;
		}else{
			$(idChk).closest("tr").removeClass('success');
			if($('#chkSelectAll').is(':checked')){
				$('#chkSelectAll').prop('checked', false);
			}
			this.IdsInputTable[index].isSelected = false;
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
					this.IdsInputTable[i].isSelected = true;
				}
			}else{
				$(this.IdsInputTable[i].chk).prop('checked', false);
				$(this.IdsInputTable[i].chk).closest("tr").removeClass('success');
				this.IdsInputTable[i].isSelected = false;
			}
		}

		this.ui.badgeSubtitlesSelected.text(this.amountChecked);
	},
	setDelayForm: function (e){
		e.preventDefault();
		$('.loading').show();
		$("#error-actions").html('');
		$('#inputDelay').closest('div').removeClass('has-error');
		var data = $(e.currentTarget).serializeObject();
		if(!validateDelayInput.test(data.inputDelay)){
			$('.loading').hide();
			$('#inputDelay').closest('div').addClass('has-error');
			var html = templateMessage({typeAlert: 'danger', title:"Error!", message: "Delay not set correctly. Remember <strong>MM:SS:mmmm</strong>."});
			$("#error-actions").html(html);
			return false;
		}
		
		if(!validateDelayMode.test(data.inputDelayMode)){
			$('.loading').hide();
			$('#inputDelay').closest('div').addClass('has-error');
			var html = templateMessage({typeAlert: 'danger', title: "Error!", message: "Delay type must be + or -."});
			$("#error-actions").html(html);
			return false;
		}

		if(this.countTimeErrors > 0){
			$('.loading').hide();
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: "You have errors in times inputs."});
			$("#error-actions").html(html);
			return false;
		}

		if(this.amountChecked == 0){
			$('.loading').hide();
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: "You have select at least 1 subtitle."});
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
		data.inputDelay = "00:"+data.inputDelay;
		var delay = moment(data.inputDelay, "HH:mm:ss SSS");
		var date0 = moment("00:00:00,000", "HH:mm:ss SSS");
		for(var i = 0; i < this.IdsInputTable.length; i++){
			if(this.IdsInputTable[i].isSelected === true){
				var startTime = $(this.IdsInputTable[i].textStart).val();
				if(startTime != "00:00:00,000" || data.inputDelayMode == "+"){
					startTime = moment(startTime, "HH:mm:ss SSS");
					if(data.inputDelayMode == "+"){
						startTime.add(delay.millisecond(), 'milliseconds');
						startTime.add(delay.seconds(), 'seconds');
						startTime.add(delay.minutes(), 'minutes');
					}else{
						//inputDelayMode == -
						startTime.subtract(delay.millisecond(), 'milliseconds');
						startTime.subtract(delay.seconds(), 'seconds');
						startTime.subtract(delay.minutes(), 'minutes');
					}
					if(startTime > date0){
						var startString = moment(new Date(startTime)).format("HH:mm:ss SSS");
						startString = startString.replace(' ', ',');
						$(this.IdsInputTable[i].textStart).val(startString);
					}else{
						$(this.IdsInputTable[i].textStart).val("00:00:00,000");
					}
				}

				var finalTime = $(this.IdsInputTable[i].textFinal).val();
				if(finalTime != "00:00:00,000" || data.inputDelayMode == "+"){
					finalTime = moment(finalTime, "HH:mm:ss SSS");
					if(data.inputDelayMode == "+"){
						finalTime.add(delay.millisecond(), 'milliseconds');
						finalTime.add(delay.seconds(), 'seconds');
						finalTime.add(delay.minutes(), 'minutes');
					}else{
						//inputDelayMode == -
						finalTime.subtract(delay.millisecond(), 'milliseconds');
						finalTime.subtract(delay.seconds(), 'seconds');
						finalTime.subtract(delay.minutes(), 'minutes');
					}
					if(finalTime > date0){
						var finalString = moment(new Date(finalTime)).format("HH:mm:ss SSS");
						finalString = finalString.replace(' ', ',');
						$(this.IdsInputTable[i].textFinal).val(finalString);
					}else{
						$(this.IdsInputTable[i].textFinal).val("00:00:00,000");
					}
				}

			}
		}
		var html = templateMessage({typeAlert: 'success', title: 'Done!', message: "Delay set correctly."});
		$("#error-actions").html(html);
		$('.loading').hide();
	},
	saveSrtFileForm: function (e){
		e.preventDefault();
		$('.loading').show();
		$("#error-save").html('');
		var data = $(e.currentTarget).serializeObject();

		if(this.countTimeErrors > 0){
			$('.loading').hide();
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: "You have errors in times inputs."});
			$("#error-save").html(html);
			return false;
		}

		if(this.countSubtitleTextErrors > 0){
			$('.loading').hide();
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: "You have errors in texts inputs."});
			$("#error-save").html(html);
			return false;
		}

		if(!(/^.*\.(srt|SRT)$/).test(data.inputNameFile)){
			$('.loading').hide();
			$("#inputNameFile").closest( ".form-group").addClass('has-error');
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: "Incorrect file name. The extension must be \".srt\"."});
			$("#error-save").html(html);
			return false;
		}else{
			$("#inputNameFile").closest( ".form-group").removeClass('has-error');
		}

		if(encodingAllows.indexOf(data.inputEncoding) == -1){
			$('.loading').hide();
			$("#inputEncoding").closest( ".form-group").addClass('has-error');
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: "Incorrect encoding type."});
			$("#error-save").html(html);
			return false;
		}else{
			$("#inputEncoding").closest( ".form-group").removeClass('has-error');
		}

		var subtitles = [];
		for(var i = 0; i < this.IdsInputTable.length; i++){
			var subtitle = {
				subtitleNumber: $(this.IdsInputTable[i].textNumber).val(),
				startTime: $(this.IdsInputTable[i].textStart).val(),
				finalTime: $(this.IdsInputTable[i].textFinal).val(),
				text:  $(this.IdsInputTable[i].textArea).val(),
			};

			subtitles.push(subtitle);
		}
		data.subtitles = subtitles;

		var str = JSON.stringify(data.subtitles);
		data.subtitles = btoa(str);

		var request = $.ajax({
			type: "POST",
			url: "/api/file/makeSrtFile",
			data: data,
			dataType: "json"
		});

		request.done(function (dataServer) {
			$('.loading').hide();
			$.fileDownload(dataServer.link, {
				successCallback: function (url) {
					var html = templateMessage({typeAlert: 'success', title: 'Done!', message: "File downloaded."});
					$("#error-save").html(html);
				},
				failCallback: function (responseHtml, url) {
					var html = templateMessage({typeAlert: 'danger', title: 'Done!', message: "Error at download file."});
					$("#error-save").html(html);
				}
			});
		});
		 
		request.fail(function (jqXHR, textStatus) {
			$('.loading').hide();
			var message;
			try{
				message = jqXHR.responseJSON.message;
			}catch(e){
				message = "Ups! An error has ocurred";
			}
			var html = templateMessage({typeAlert: 'danger', title: 'Error!', message: message});
			$("#error-save").html(html);
		});
		
	},
	keysInInputDelay: function (e){
		if(keyAllows.indexOf(e.keyCode) == -1){
			e.preventDefault();
		}
	},
	validateTimeInput: function (e){
		var inputValue = $(e.currentTarget).val();
		if(!validateTimes.test(inputValue)){
			this.countTimeErrors += 1;
			$(e.currentTarget).closest('div').addClass('has-error');
		}else{
			this.countTimeErrors -= 1;
			$(e.currentTarget).closest('div').removeClass('has-error');
		}
	},
	validateSubtitleText: function (e){
		var textAreaValue = $(e.currentTarget).val().trim();
		if(textAreaValue.length == 0){
			this.countSubtitleTextErrors += 1;
			$(e.currentTarget).closest('td').addClass('has-error');
		}else{
			this.countSubtitleTextErrors -= 1;
			$(e.currentTarget).closest('td').removeClass('has-error');
		}
	}

});

export default HomeLayoutView;