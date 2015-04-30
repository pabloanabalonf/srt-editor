"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');

var Router = require('./router');
var Controller = require('./controllers/app-controller');

var MyApp = new Marionette.Application();

MyApp.addRegions({
	mainRegion: '#tmpl-container'
});

var controller = new Controller(MyApp.mainRegion);
MyApp.addInitializer(function (options){
	var router = new Router({
		controller: controller
	});
});



MyApp.on("start", function(options){
	if (Backbone.history){
		Backbone.history.start();
	}
});

MyApp.start();