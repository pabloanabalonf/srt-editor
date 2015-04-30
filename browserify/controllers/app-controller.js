"use strict";
var Marionette = require('backbone.marionette');
var HomeLayoutView = require('../views/home');
var NotFoundLayoutView = require('../views/not-found');

var Controller = Marionette.Controller.extend({
	initialize: function (MainRegion){
		this.mainRegion = MainRegion;
	},
	home: function (){
		this.mainRegion.show(new HomeLayoutView());
	},
	notFound: function (){
		this.mainRegion.show(new NotFoundLayoutView());	
	}
});

module.exports = Controller;