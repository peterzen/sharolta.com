/**
 * Created by Meki on 2015.02.25..
 */

/* Get dependencies */
var gulp = require('gulp'),
	sass = require('gulp-ruby-sass'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	exec = require('gulp-exec'),
	browserSync = require('browser-sync'),
	del = require('del');

/* Set paths */

var paths = {
	dist: 'dist',
	/* Source paths */
	styles: ['assets/sass/main.scss'],
	scripts: [
		'assets/bower_components/jquery/dist/jquery.js',
		'assets/bower_components/jquery.easing/js/jquery.easing.js',
		'assets/bower_components/bootstrap/dist/js/bootstrap.js',
		'assets/js/grayscale.js'
	],
	images: ['assets/images/**/*'],
	fonts: [
		'assets/bower_components/bootstrap/fonts/*',
		'assets/bower_components/font-awesome/fonts/*'
	],

	/* Output paths */
	stylesOutput: 'dist/styles',
	scriptsOutput: 'dist/js',
	imagesOutput: 'dist/images',
	fontsOutput: 'dist/fonts'
};

/* Tasks */
gulp.task('styles', function () {
	return sass(paths.styles, {style: 'expanded'})
		.pipe(gulp.dest(paths.stylesOutput))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest(paths.stylesOutput))
		.pipe(notify({message: 'Styles task complete'}));
});

gulp.task('scripts', function () {
	return gulp.src(paths.scripts)
		//.pipe(jshint('.jshintrc'))
		//.pipe(jshint.reporter('default'))
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.scriptsOutput))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.scriptsOutput))
		.pipe(notify({message: 'Scripts task complete'}));
});

gulp.task('images', function () {
	return gulp.src(paths.images)
		.pipe(cache(imagemin({optimizationLevel: 5, progressive: true, interlaced: true})))
		.pipe(gulp.dest(paths.imagesOutput))
		.pipe(notify({message: 'Images task complete'}));
});

gulp.task('fonts', function () {
	return gulp.src(paths.fonts)
		.pipe(gulp.dest(paths.fontsOutput))
		.pipe(notify({message: 'Fonts task complete', onLast: true}));
});

gulp.task('clean', function (cb) {
	del([paths.dist], cb)
});

gulp.task('default', ['clean'], function () {
	gulp.start('styles', 'scripts', 'images', 'fonts', 'html');
});


gulp.task('deploy', function () {
	var options = {
		continueOnError: false, // default = false, true means don't emit error event
		pipeStdout: true, // default = false, true means stdout is written to file.contents
	};
	return gulp.src([
		'dist/'
	])
		.pipe(exec('gsutil -m rsync -c -d -r dist/ gs://www.sharolta.com', options));

});


gulp.task('html', [], function () {
	return gulp.src('*.{html,png,ico}')
		.pipe(gulp.dest('dist'));
});

const reload = browserSync.reload;

gulp.task('serve', ['html', 'images', 'styles', 'scripts', 'fonts'], function () {
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['dist'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch([
		'dist/*.html',
		'dist/js/*.js',
		'dist/images/*',
		'dist/styles/*'
	]).on('change', reload);

	gulp.watch('*.html', ['html']);
	gulp.watch('assets/sass/**/*.scss', ['styles']);
	gulp.watch('assets/js/*.js', ['scripts']);
	gulp.watch('assets/images/*', ['images']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});
