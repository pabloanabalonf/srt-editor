var Backbone = require('Backbone');
var SubtitleModel = require('../models/subtitle');

var SubtitlesCollection = Backbone.Collection.extend({
	model: SubtitleModel
});

module.exports = SubtitlesCollection;