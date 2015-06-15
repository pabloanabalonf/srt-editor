import Marionette from 'backbone.marionette';
import _ from 'underscore';
//template
import templateSubtitleListItem from '../templates/subtitle-list-item.html';

let SubtitleItemView = Marionette.ItemView.extend({
	tagName: "tr",
	template: (serialized_model) => {
		return templateSubtitleListItem(serialized_model);
	},
});

export default SubtitleItemView;