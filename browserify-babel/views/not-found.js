import Marionette from 'backbone.marionette';
import templateNotFound from '../templates/not-found.html';
import $ from 'jquery';

let NotFoundLayoutView = Marionette.LayoutView.extend({
	initialize: () => {
		this.template = templateNotFound({message: 'Page Not Found'});
	},
	onShow: () => {
		$('.loading').hide();
	},
	onDestroy: () => {
		console.log('onDestroy NotFoundLayoutView');
	}
});

export default NotFoundLayoutView;