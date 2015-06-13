import Marionette from 'backbone.marionette';

import SubtitleItemView from './subtitle-item-view';

let SubtitlesCollectionView = Marionette.CollectionView.extend({
	tagName: 'tbody',
	childView: SubtitleItemView,
	initialize: (options) => {
	}
});

export default SubtitlesCollectionView;