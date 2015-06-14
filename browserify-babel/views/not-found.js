import Marionette from 'backbone.marionette';
import $ from 'jquery';

import templateNotFound from '../templates/not-found.html';
let NotFoundLayoutView = Marionette.LayoutView.extend({
	initialize: function() {
		var html = templateNotFound({message: 'Page Not Found'});
		this.template = html;
	},
	onShow: () => {
		$('.loading').hide();
	},
	onDestroy: () => {
	}
});

export default NotFoundLayoutView;