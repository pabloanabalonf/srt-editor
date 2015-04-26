var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

//views
var HomeView = require('./views/home');
var NotFoundView = require('./views/not-found');

Backbone.View.prototype.close = function (){
	this.remove();
	this.unbind();
};

Backbone.View.prototype.remove = function (){
	this.$el.empty();
	this.stopListening();
	this.undelegateEvents();
	return this;
};

var AppRouter = Backbone.Router.extend({
	routes: {
		'': 'home',
		'*notFound': 'notFound',
	},
	AppView: function (view, renderData){
		renderData = renderData || {};
		if(this.currentView) this.currentView.close();

		this.currentView = view;
		this.currentView.render(renderData);
	},
	initialize: function (){
		this.on('route:home', function (){
			this.AppView(new HomeView());
		});

		this.on('route:notFound', function (){
			this.AppView(new NotFoundView());
		});
		// Backbone.history has already been started
		Backbone.history.start();
	}
});



module.exports = AppRouter;