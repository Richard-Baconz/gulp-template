const gulp 		     = require('gulp');
const browserSync  = require('browser-sync').create();
const debug 	     = require('gulp-debug');
const concat 	     = require('gulp-concat');
const sourcemaps   = require('gulp-sourcemaps');
const sass 	 	     = require('gulp-sass');
const del 		     = require('del');
const imagemin 	   = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const uglifyJs     = require('gulp-uglify');
const uglifyCss    = require('gulp-uglifycss');
const pug         = require('gulp-pug');

path = {
	styles_from:['app/css/**/*.css',
				 'app/sass/libs/**/*.{css,sass,scss}',
				 'app/sass/main.{sass,scss}',
				 '!app/css/main.min.css'],

	js_from:    ['app/js/libs/**/*.js',
				 'app/js/**/*.js',
				 '!app/js/common.min.js'],

	img_from:   ['app/img/**/*.*'],

};

//HTML___________________________________________
gulp.task('pug', function() {
    return gulp.src(['app/**/*.pug',
					 '!app/**/modules/**/*.pug'])
        .pipe(pug({
					verbose: true,
					pretty: true,
				})) // pip to jade plugin
        .pipe(gulp.dest('app')); // tell gulp our output folder
});
//HTML___________________________________________


//STYLES_________________________________________
gulp.task('sass', function() {
	return gulp.src(path.styles_from)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(debug({title:'sass'}))
		.pipe(concat('main.min.css'))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('app/css'))
});

gulp.task('sass_uglify', function() {
	return gulp.src(path.styles_from)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(debug({title:'sass'}))
		.pipe(concat('main.min.css'))
		.pipe(autoprefixer())
		.pipe(uglifyCss({
	      "uglyComments": true
	    }))
		.pipe(gulp.dest('app/css'))
});
//STYLES_________________________________________


//JAVASCRIPT_____________________________________
gulp.task('js', function() {
	return gulp.src(path.js_from)
		.pipe(debug({title:'javascript'}))
		.pipe(concat('common.min.js'))
		.pipe(gulp.dest('app/js'))
});

gulp.task('js_uglify', function() {
	return gulp.src(path.js_from)
		.pipe(debug({title:'javascript'}))
		.pipe(concat('common.min.js'))
		.pipe(uglifyJs())
		.pipe(gulp.dest('app/js'))
});
//JAVASCRIPT_____________________________________


//STYLES AND SCRIPT WATCH________________________
gulp.task('watch', function(){
	gulp.watch((path.styles_from).concat('app/sass/**.sass'))
		.on('change', () => {setTimeout(gulp.series('sass'),500)})

	gulp.watch(path.js_from)
		.on('change', gulp.series('js'));

	gulp.watch('app/**/*.pug')
	.on('change', gulp.series('pug'));
});
//STYLES AND SCRIPT WATCH________________________


//SERVER_________________________________________
gulp.task('serve', function(callback) {
	browserSync.init({
		server:'app'
	});

	browserSync.watch('app').on('change', browserSync.reload);
	callback();
});
//SERVER_________________________________________


//DEFAULT________________________________________
gulp.task('default', gulp.series(gulp.parallel('sass','js'), gulp.parallel('serve','watch')));
//DEFAULT________________________________________




//CLEAN DIST_____________________________________
gulp.task('removedist', function() { return del('dist'); });
//CLEAN DIST_____________________________________

//IMAGES_________________________________________
gulp.task('imagemin', function() {
	return gulp.src(path.img_from)
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img'));
});
//IMAGES_________________________________________

//BUILD DIST_____________________________________
gulp.task('build', gulp.series('removedist','pug', gulp.parallel('imagemin', 'sass_uglify', 'js_uglify'), function(callback) {

	var buildFiles = gulp.src('app/*.html')
		.pipe(gulp.dest('dist'));

	var buildCss = gulp.src('app/css/main.min.css')
		.pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src('app/js/common.min.js')
		.pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	var buildImg = gulp.src('app/img/**/*')
		.pipe(gulp.dest('dist/img'));

	callback();
}));
//BUILD DIST_____________________________________
