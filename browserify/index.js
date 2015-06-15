import $ from 'jquery';
import Backbone from 'backbone';
Backbone.$ = $;
import Marionette from 'backbone.marionette';

import Router from './router';
import Controller from './controller';

let MyApp = new Marionette.Application();

let controller = new Controller();

MyApp.addInitializer((options) => {
	let router = new Router({
		controller: controller
	});
});

MyApp.on("start", (options) => {
	if (Backbone.history){
		Backbone.history.start();
	}
});

MyApp.start();