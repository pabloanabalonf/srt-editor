import $  from 'jquery';
import Backbone from 'backbone';

Backbone.$ = $;

let FileModel = Backbone.Model.extend({
	urlRoot: '/api/file',
	readFile: (file) => {
		let reader = new FileReader();
		let that = this;
		let deferred = $.Deferred();
		reader.onload = ((mockFile) => {
			return (e) => {
				let data = {
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

export default FileModel;