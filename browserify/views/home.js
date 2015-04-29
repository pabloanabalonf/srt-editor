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
/*var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var template = require('../templates/home.html');

var HomeView = Backbone.View.extend({
	el: $('#tmpl-container'),
	initialize: function (){
		this.delegateEvents();
	},
	render: function (){
		var html = template({});
		this.$el.html(html);
	}
});

module.exports = HomeView; */