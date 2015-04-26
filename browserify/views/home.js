var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var HomeView = Backbone.View.extend({
	el: $('#test'),
	initialize: function (){
		this.delegateEvents();
	},
	render: function (){
		this.$el.html('<h1>Works!!! /o/</h1>');
	}
});

module.exports = HomeView;