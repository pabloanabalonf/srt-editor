var Backbone = require('Backbone');
var SubtitleModel = Backbone.Model.Extend({
	defaults: {
		subtitleNumber: 1,
		startTime: '00:00:00,0000',
		finalTime: '00:00:00,0000',
		text: ''
	}
});

module.exports = SubtitleModel;