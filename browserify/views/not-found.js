"use strict";
var Marionette = require('backbone.marionette');
var templateNotFound = require('../templates/not-found.html');

var NotFoundLayoutView = Marionette.LayoutView.extend({
	initialize: function (){
		this.template = templateNotFound({message: 'Page Not Found'});
	},
	template: this.template,
	onShow: function (){
		console.log('onShow NotFoundLayoutView');
	},
	onDestroy: function (){
		console.log('onDestroy NotFoundLayoutView');
	}
});

module.exports = NotFoundLayoutView;