var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var NotFoundView = Backbone.View.extend({
	el: $('#test'),
	initialize: function (){
		this.delegateEvents();
	},
	render: function (){
		this.$el.html('<h1>Page not found</h1>');
	}
});

module.exports = NotFoundView;