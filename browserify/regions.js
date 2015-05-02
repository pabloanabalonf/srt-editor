var Marionette = require('backbone.marionette');

var RegionManager = new Marionette.RegionManager();

RegionManager.addRegions({
	mainRegion: '#tmpl-container',
	subtitles: "#render-subtitles"
});

module.exports = RegionManager;