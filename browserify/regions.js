"use strict";
var Marionette = require('backbone.marionette');

var RegionManager = new Marionette.RegionManager();

RegionManager.addRegions({
	mainRegion: '#tmpl-container'
});

module.exports = RegionManager;