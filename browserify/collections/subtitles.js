import Backbone from 'backbone';
import SubtitleModel from '../models/subtitle';

let SubtitlesCollection = Backbone.Collection.extend({
	model: SubtitleModel
});

export default SubtitlesCollection;