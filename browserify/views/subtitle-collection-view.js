var Marionette = require('backbone.marionette');

var SubtitleItemView = require('./subtitle-item-view');

var SubtitlesCollectionView = Marionette.CollectionView.extend({
	tagName: "div",
	chilView: this.SubtitleItemView,
	initialize: function (){
		this.SubtitleItemView = new SubtitleItemView();
	}
});

module.exports = SubtitlesCollectionView;