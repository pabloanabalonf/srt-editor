"use strict";
var Marionette = require('backbone.marionette');
var templateHome = require('../templates/home.html');

var HomeLayoutView = Marionette.LayoutView.extend({
	initialize: function (renderData){
		this.template = templateHome(renderData);
	},
	template: this.template
});

module.exports = HomeLayoutView;