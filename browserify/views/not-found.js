"use strict";
var Marionette = require('backbone.marionette');
var templateNotFound = require('../templates/not-found.html');

var NotFoundLayoutView = Marionette.LayoutView.extend({
	initialize: function (){
		this.template = templateNotFound({message: 'Page Not Found'});
	},
	template: this.template
});

module.exports = NotFoundLayoutView;

/*var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var template = require('../templates/not-found.html');

var NotFoundView = Backbone.View.extend({
	el: $('#tmpl-container'),
	initialize: function (){
		this.delegateEvents();
	},
	render: function (){
		var html = template({message: 'Page Not Found'});
		this.$el.html(html);
	}
});

module.exports = NotFoundView;*/