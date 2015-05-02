"use strict";
var Marionette = require('backbone.marionette');
var HomeLayoutView = require('../views/home');
var NotFoundLayoutView = require('../views/not-found');

//regions
var rm = require('../regions');

var Controller = Marionette.Controller.extend({
	initialize: function (){
	},
	home: function (){
		rm.get('mainRegion').show(new HomeLayoutView());
	},
	notFound: function (){
		rm.get('mainRegion').show(new NotFoundLayoutView());
	}
});

module.exports = Controller;