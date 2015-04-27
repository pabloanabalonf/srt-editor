var $ = require('jquery');
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

module.exports = HomeView;