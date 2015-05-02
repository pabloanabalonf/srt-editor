var Backbone = require('backbone');
var SubtitleModel = Backbone.Model.extend({
	defaults: {
		subtitleNumber: 1,
		startTime: '00:00:00,0000',
		finalTime: '00:00:00,0000',
		text: ''
	}
});

module.exports = SubtitleModel;