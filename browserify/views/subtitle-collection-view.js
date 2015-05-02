var Marionette = require('backbone.marionette');

var SubtitleItemView = require('./subtitle-item-view');

var SubtitlesCollectionView = Marionette.CollectionView.extend({
	tagName: 'tbody',
	childView: SubtitleItemView,
});

module.exports = SubtitlesCollectionView;