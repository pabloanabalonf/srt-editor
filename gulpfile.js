var gulp = require("gulp");
var browserify = require("browserify");
var watchify = require("watchify");
var underscorify = require("node-underscorify");
var source = require("vinyl-source-stream");
var gutil = require("gulp-util");
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

var mainBundler = watchify(browserify("./browserify/index.js"));
mainBundler.transform(underscorify.transform());
gulp.task("watchify-main", bundleMain);
mainBundler.on("update", bundleMain);
mainBundler.on("log", gutil.log);

function bundleMain() {
	return mainBundler.bundle()
		.on("error", gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source("app.js"))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest("./public/js"));
}