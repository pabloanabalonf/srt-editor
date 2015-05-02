var Marionette = require('backbone.marionette');

//template
var templateSubtitleListItem = require('../templates/subtitle-list-item.html');

var SubtitleItemView = Marionette.ItemView.extend({
	initialize: function (obj){
		this.template = templateSubtitleListItem(obj);
	},
	tagName: "tr",
	template: this.template
});

module.exports = SubtitleItemView;