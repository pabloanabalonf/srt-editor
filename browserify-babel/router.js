import Marionette from 'backbone.marionette';

let Router = Marionette.AppRouter.extend({
	appRoutes: {
		"": "home",
		"*notFound": "notFound"
	},
});

export default Router;