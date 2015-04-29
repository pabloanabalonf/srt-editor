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