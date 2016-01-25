'use strict';

//--------------------------------------------------------------//
//------ General variables ------//
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    del = require('del'),
    browserSync = require('browser-sync'),
    merge = require('merge-stream'),
    buffer = require('vinyl-buffer'),
    runSequence = require('run-sequence');


//--------------------------------------------------------------//
//------ Custom paths ------//
var gPaths = {
    prod: './prod',
    dev: './dev',
    clearPathDev: ['dev', './app/sass/sprite.scss'],
    clearPathProd: ['prod', './app/sass/sprite.scss'],
    bower: './bower_components'
};

function paths(target) {
    return {
        js: {
            src: './app/js/*.js',
            vendorsDest: './app/js/vendors/*.js',
            vendorsConcatSrc: [
                gPaths.bower + '/jquery/jquery.js',
                gPaths.bower + '/jquery-placeholder/jquery.placeholder.js',
                gPaths.bower + '/bPopup/jquery.bpopup.js',
                gPaths.bower + '/jquery-validation/dist/jquery.validate.js'
            ],
            modernizrSrc: gPaths.bower + '/modernizr/modernizr.js',
            dest: target + '/js',
            order: ['jquery.js', 'jquery.placeholder.js', 'jquery.bpopup.js', 'jquery.validate.js']
        },

        sass: {
            src: './app/sass/**/*.scss',
            files: [gPaths.bower + '/normalize-css/normalize.css', './app/sass/styles.scss'],
            dest: target + '/css'
        },

        img: {
            src: './app/img/**/*.{png,jpg,jpeg,gif,svg}',
            dest: target + '/img'
        },

        favicon: {
            src: './app/favicon/favicon.png',
            dest: target + '/favicon'
        },

        sprite: {
            src: './app/sprite/**/*.png',
            destImg: target + '/img',
            destCss: 'app/sass'
        },

        fonts: {
            src: './app/fonts/**/*.{eot,svg,ttf,woff,woff2}',
            dest: target + '/fonts'
        },

        jade: {
            src: './app/jade/**/*.jade',
            srcPages: './app/jade/pages/**/*.jade'
        },

        watch: [
            gPaths.bower,
            './app/js/*.js',
            './app/sass/**/*.scss',
            './app/img/**/*.{png,jpg,jpeg,gif,svg}',
            './app/favicon/favicon.png',
            './app/fonts/**/*.{eot,svg,ttf,woff,woff2}',
            './app/jade/**/*.jade'
        ]
    }
}


//--------------------------------------------------------------//
//------ Development Tasks ------//

//------ Favicon ------//
gulp.task('favicon-dev', function () {
    var FAVICON_DATA_FILE = paths(gPaths.dev).favicon.dest + '/faviconData.json';

    plugins.realFavicon.generateFavicon({
        masterPicture: paths(gPaths.dev).favicon.src,
        dest: paths(gPaths.dev).favicon.dest,
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'noChange',
                appName: 'html5Template'
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override',
                appName: 'html5Template'
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    name: 'html5Template',
                    display: 'browser',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    });
});

//------ Clean ------//
gulp.task('clean-dev', function (callback) {
    return del(gPaths.clearPathDev, callback);
});

//------ All styles task ------//
gulp.task('styles-dev', function (callback) {
    runSequence('sprite-dev', 'styles:sass-dev', callback);
});

//------ SASS ------//
gulp.task('styles:sass-dev', function () {
    return gulp.src(paths(gPaths.dev).sass.files)
        .pipe(plugins.plumber())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.concat('styles.css'))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'IE 8-9']
        }))
        .pipe(gulp.dest(paths(gPaths.dev).sass.dest))
});

//------ Sprite ------//
gulp.task('sprite-dev', function () {
    var spriteData = gulp.src(paths(gPaths.dev).sprite.src).pipe(plugins.spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.scss',
        imgPath: '../img/sprite.png'
    }));

    var imgStream = spriteData.img
        .pipe(plugins.plumber())
        .pipe(buffer())
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(paths(gPaths.dev).sprite.destImg));

    var cssStream = spriteData.css
        .pipe(gulp.dest(paths(gPaths.dev).sprite.destCss));

    return merge(imgStream, cssStream);
});

//------ All js ------//
gulp.task('js-dev', ['js:vendors-dev', 'js:modernizr-dev', 'js:myScripts-dev']);

gulp.task('js:vendors-dev', function(){
    return gulp.src(paths(gPaths.dev).js.vendorsConcatSrc)
        .pipe(plugins.plumber())
        .pipe(plugins.order(paths(gPaths.dev).js.order))
        .pipe(plugins.concat('vendors.js'))
        .pipe(gulp.dest(paths(gPaths.dev).js.dest));
});

//------ Modernizr.js ------//
gulp.task('js:modernizr-dev', function () {
    return gulp.src(paths(gPaths.dev).js.modernizrSrc)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(paths(gPaths.dev).js.dest));
});

//------ My Scripts ------//
gulp.task('js:myScripts-dev', function () {
    return gulp.src(paths(gPaths.dev).js.src)
        .pipe(plugins.plumber())
        .pipe(plugins.concat('scripts.js'))
        .pipe(gulp.dest(paths(gPaths.dev).js.dest));
});

//------ Images ------//
gulp.task('images-dev', function () {
    return gulp.src(paths(gPaths.dev).img.src)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(paths(gPaths.dev).img.dest));
});

//------ Fonts ------//
gulp.task('fonts-dev', function () {
    return gulp.src(paths(gPaths.dev).fonts.src)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(paths(gPaths.dev).fonts.dest));
});

//------ Jade ------//
gulp.task('jade-dev', function () {
    return gulp.src(paths(gPaths.dev).jade.srcPages)
        .pipe(plugins.plumber())
        .pipe(plugins.jade({
            pretty: true
        }))
        .pipe(gulp.dest(gPaths.dev));
});

//------ Server browser-sync ------//
gulp.task('browser-sync-dev', function () {
    browserSync({
        port: 9000,
        server: {
            baseDir: gPaths.dev
        }
    });
});

//------ Watch ------//
gulp.task('watch-dev', function () {
    gulp.watch(gPaths.bower, ['styles-dev', 'js-dev']);
    gulp.watch(paths(gPaths.dev).sass.src, ['styles-dev']);
    gulp.watch(paths(gPaths.dev).jade.src, ['jade-dev']);
    gulp.watch(paths(gPaths.dev).js.src, ['js:myScripts-dev']);
    gulp.watch(paths(gPaths.dev).img.src, ['images-dev']);
    gulp.watch(paths(gPaths.dev).sprite.src, ['styles-dev']);
    gulp.watch(paths(gPaths.dev).watch).on('change', browserSync.reload);
});

//------ Build project to dev ------//
gulp.task('build-dev', function (callback) {
    runSequence('clean-dev', ['styles-dev', 'js-dev', 'images-dev', 'fonts-dev', 'favicon-dev', 'jade-dev'], callback);
});

//------ Build project to dev and start server ------//
gulp.task('default', function (callback) {
    runSequence('clean-dev', ['build-dev'], 'browser-sync-dev', 'watch-dev', callback);
});


//--------------------------------------------------------------//
//------ Production Tasks ------//

//------ Favicon ------//
gulp.task('favicon-prod', function () {
    var FAVICON_DATA_FILE = paths(gPaths.prod).favicon.dest + '/faviconData.json';

    plugins.realFavicon.generateFavicon({
        masterPicture: paths(gPaths.prod).favicon.src,
        dest: paths(gPaths.prod).favicon.dest,
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'noChange',
                appName: 'html5Template'
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override',
                appName: 'html5Template'
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    name: 'html5Template',
                    display: 'browser',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                }
            },
            safariPinnedTab: {
                pictureAspect: 'silhouette',
                themeColor: '#5bbad5'
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false
        },
        markupFile: FAVICON_DATA_FILE
    });
});

//------ Clean ------//
gulp.task('clean-prod', function (callback) {
    return del(gPaths.clearPathProd, callback);
});

//------ All styles task ------//
gulp.task('styles-prod', function (callback) {
    runSequence('sprite-prod', 'styles:sass-prod', callback);
});

//------ SASS ------//
gulp.task('styles:sass-prod', function () {
    return gulp.src(paths(gPaths.prod).sass.files)
        .pipe(plugins.plumber())
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.concat('styles.css'))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'IE 8-9']
        }))
        .pipe(plugins.cssnano())
        .pipe(gulp.dest(paths(gPaths.prod).sass.dest));
});

//------ Sprite ------//
gulp.task('sprite-prod', function () {
    var spriteData = gulp.src(paths(gPaths.prod).sprite.src).pipe(plugins.spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.scss',
        imgPath: '../img/sprite.png'
    }));

    var imgStream = spriteData.img
        .pipe(plugins.plumber())
        .pipe(buffer())
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(paths(gPaths.prod).sprite.destImg));

    var cssStream = spriteData.css
        .pipe(gulp.dest(paths(gPaths.prod).sprite.destCss));

    return merge(imgStream, cssStream);
});

//------ All js ------//
gulp.task('js-prod', ['js:vendors-prod', 'js:modernizr-prod', 'js:myScripts-prod']);

gulp.task('js:vendors-prod', function(){
    return gulp.src(paths(gPaths.prod).js.vendorsConcatSrc)
        .pipe(plugins.plumber())
        .pipe(plugins.order(paths(gPaths.prod).js.order))
        .pipe(plugins.concat('vendors.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths(gPaths.prod).js.dest));
});

//------ Modernizr.js ------//
gulp.task('js:modernizr-prod', function () {
    return gulp.src(paths(gPaths.dev).js.modernizrSrc)
        .pipe(plugins.plumber())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths(gPaths.prod).js.dest));
});

//------ My Scripts ------//
gulp.task('js:myScripts-prod', function () {
    return gulp.src(paths(gPaths.prod).js.src)
        .pipe(plugins.plumber())
        .pipe(plugins.concat('scripts.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths(gPaths.prod).js.dest));
});

//------ Images ------//
gulp.task('images-prod', function () {
    return gulp.src(paths(gPaths.prod).img.src)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(paths(gPaths.prod).img.dest));
});

//------ Fonts ------//
gulp.task('fonts-prod', function () {
    return gulp.src(paths(gPaths.prod).fonts.src)
        .pipe(plugins.plumber())
        .pipe(gulp.dest(paths(gPaths.prod).fonts.dest));
});

//------ Jade ------//
gulp.task('jade-prod', function () {
    return gulp.src(paths(gPaths.prod).jade.srcPages)
        .pipe(plugins.plumber())
        .pipe(plugins.jade())
        .pipe(gulp.dest(gPaths.prod));
});

//------ Build project to prod ------//
gulp.task('build-prod', function (callback) {
    runSequence('clean-prod', ['styles-prod', 'js-prod', 'images-prod', 'fonts-prod', 'favicon-prod', 'jade-prod'], callback);
});

//--------------------------------------------------------------//
//------ Pretty error view ------//
var log = function (error) {
    console.log([
        '',
        "----------ERROR MESSAGE START----------",
        ("[" + error.name + " in " + error.plugin + "]"),
        error.message,
        "----------ERROR MESSAGE END----------",
        ''
    ].join('\n'));
    this.end();
};