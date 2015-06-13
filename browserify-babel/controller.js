
import Marionette from 'backbone.marionette';
import HomeLayoutView from './views/home';
import NotFoundLayoutView from './views/not-found';

//regions
import rm from './regions';

let Controller = Marionette.Controller.extend({
	initialize: function (){
	},
	home: function (){
		rm.get('mainRegion').show(new HomeLayoutView());
	},
	notFound: function (){
		rm.get('mainRegion').show(new NotFoundLayoutView());
	}
});

export default Controller;