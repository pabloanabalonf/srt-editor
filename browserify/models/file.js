var $ = require('jquery');
var Backbone = require('backbone');
Backbone.$ = $;
var FileModel = Backbone.Model.extend({
	urlRoot: '/api/file',
	readFile: function (file){
		var reader = new FileReader();
		var that = this;
		var deferred = $.Deferred();
		reader.onload = (function (mockFile){
			return function (e){
				var data = {
					file: mockFile,
					data: btoa(e.target.result)
				};
				deferred.resolve(data);
			};
		})(file);
		reader.readAsBinaryString(file);
		return deferred.promise();
	}
});

module.exports = FileModel;