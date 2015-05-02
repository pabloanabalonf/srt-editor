var Marionette = require('backbone.marionette');
var _ = require('underscore');
//template
var templateSubtitleListItem = require('../templates/subtitle-list-item.html');

var SubtitleItemView = Marionette.ItemView.extend({
	tagName: "tr",
	template: function (serialized_model){
		return templateSubtitleListItem(serialized_model);
	},
});

module.exports = SubtitleItemView;