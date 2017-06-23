'use strict';

var gulp = require('gulp'),

    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,

    gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

const DIST_FOLDER = 'dist';
const DEV_FOLDER = 'dev';
const COMMONBLOCK_FOLDER = 'common_blocks';
const APP_NAME = 'learn_js';

var path = {
    build: {
        html: DIST_FOLDER + '/',
        pug: DIST_FOLDER + '/',
        //js: DIST_FOLDER + '/js/',
        js: DIST_FOLDER + '/',
        //css: DIST_FOLDER + '/css/',
        css: DIST_FOLDER + '/',
        styl: DIST_FOLDER + '/',
        img: DIST_FOLDER + '/img/',
        fonts: DIST_FOLDER + '/fonts/'
    },
    src: {
        html: 'src/**/*.html',
        pug: ['!src/common_blocks/**/*.pug', 'src/**/*.pug'],
        //js: 'src/js/main.js',
        js: 'src/**/*.js',
        //style: 'src/style/main.scss',
        style: 'src/**/*.*ss',
        styl: ['!src/common_blocks/**/*.styl', 'src/**/*.styl'],
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        pug: 'src/**/*.pug',
        //js: 'src/js/**/*.js',
        js: 'src/**/*.js',
        //style: 'src/style/**/*.scss',
        style: 'src/**/*.*ss',
        styl: 'src/**/*.styl',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    prettify: {
        js: './',
    },
    clean: './' + DIST_FOLDER
};

var config = {
    server: {
        baseDir: "./" + DIST_FOLDER
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: APP_NAME
};

function onerror(e) {
    console.log('>>> error:\n', e.name);
    console.log('---> message <---\n', e.message);
    console.log('---> reason <---\n', e.reason);
    this.emit('end');
}

gulp.task('webserver', function() {
    browserSync(config);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('pug:build', function() {
    gulp.src(path.src.pug)
        .on('error', onerror)
        .pipe(plugins.pug({
            pretty: true
        }))
        .pipe(gulp.dest(path.build.pug))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .on('error', onerror)
        .pipe(plugins.rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .on('error', onerror)
        //    .pipe(rigger())
        //    .pipe(sourcemaps.init())
        .pipe(plugins.uglify().on('error', function(error) {
            //console.log(error.message);
            plugins.util.log(error);
            process.exit(1);
        }))
        //    .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('styl:build', function() {
    gulp.src(path.src.styl)
        .on('error', onerror)
        /*
        .pipe(sourcemaps.init())
        .pipe(sass({
        includePaths: ['src/style/'],
        outputStyle: 'compressed',
        sourceMap: true,
        errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())*/
        .pipe(plugins.stylus({
            'include css': true
        }))
        .pipe(gulp.dest(path.build.styl))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .on('error', onerror)
        /*
        .pipe(sourcemaps.init())
        .pipe(sass({
        includePaths: ['src/style/'],
        outputStyle: 'compressed',
        sourceMap: true,
        errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())*/
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('image:build', function() {
    gulp.src(path.src.img)
        .on('error', onerror)
        .pipe(plugins.imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .on('error', onerror)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('js:prettify', function() {
    gulp.src(path.src.js, {
            base: "./"
        })
        .on('error', onerror)
        .pipe(plugins.plumber())
        .pipe(plugins.jsbeautifier({
            "indent_size": 4,
            "indent_char": ' ',
            "js": {
                "indent_size": 2
            }
        }))
        .pipe(plugins.notify(function(file) {

            if (file.jsbeautify.beautified) {
                return "Found file: <%= file.relative %>!"
            } else {
                return false;
            }
        }))
        .pipe(plugins.if(function(file) {
            return file.jsbeautify.beautified;
        }, gulp.dest(path.prettify.js)))
});

gulp.task('build', [
    'js:prettify',
    'pug:build',
    'html:build',
    'js:build',
    'style:build',
    'styl:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function() {
    plugins.watch([path.watch.pug], function(event, cb) {
        gulp.start('pug:build');
    });
    plugins.watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    plugins.watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    plugins.watch([path.watch.styl], function(event, cb) {
        gulp.start('styl:build');
    });
    plugins.watch([path.watch.js], function(event, cb) {
        gulp.start('js:prettify');
        gulp.start('js:build');
    });
    plugins.watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    plugins.watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);
