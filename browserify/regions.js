import Marionette from 'backbone.marionette';

let RegionManager = new Marionette.RegionManager();

RegionManager.addRegions({
	mainRegion: "#tmpl-container"
});

export default RegionManager;