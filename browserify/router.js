"use strict";
var Marionette = require('backbone.marionette');

var Router = Marionette.AppRouter.extend({
	appRoutes: {
		"": "home",
		"*notFound": "notFound"
	},
	/* Doesn't work when *noFound is defined
	routes: {
		"sayhi/:name": "sayHi"
	},
	sayHi: function (name){
		alert("Hi "+ name);
	} */
});

module.exports = Router;
/*

//Backbone way

//views
var Backbone = require('backbone');
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
		Backbone.history.start();
	}
});



module.exports = AppRouter; */