'use strict';

//--------------------------------------------------------------//
//------ General variables ------//
var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    rimraf = require('rimraf'),
    browserSync = require('browser-sync'),
    merge = require('merge-stream'),
    buffer = require('vinyl-buffer'),
    runSequence = require('run-sequence');


//--------------------------------------------------------------//
//------ Custom paths ------//
var paths = {
    prod: './prod/',
    dev: './dev/',
    bower: './bower/',
    myScriptsSrc: './app/js/**/*.js',
    jsDevTarget: './dev/js',
    sassSrc: './app/sass/**/*.scss',
    sassSrcFile: './app/sass/styles.scss',
    cssDevTarget: './dev/css/',
    imagesSrc: './app/img/**/*.{png,jpg,jpeg,gif, svg}',
    imagesDevTarget: './dev/img',
    faviconSrc: './app/favicon/**/*.{png,xml,json,svg,ico}',
    faviconDevTarget: './dev/favicon',
    spriteSrc: './app/sprite/**/*.png',
    spriteImgDevTarget: './dev/img',
    spriteCssDevTarget: './app/sass/',
    fontsSrc: './app/fonts/**/*.{eot,svg,ttf,woff,woff2}',
    fontsDevTarget: './dev/fonts',
    jadeSrc: './app/jade/**/*.jade',
    jadePagesSrc: './app/jade/pages/**/*.jade',
    jadeDevTarget: './dev/'
};


//--------------------------------------------------------------//
//------ All Pipes ------//
var pipes = {};

// Favicon
pipes.favicon = function () {
    return gulp.src(paths.faviconSrc)
        .pipe(gulp.dest(paths.faviconDevTarget));
};

//------ SASS pipe------//
pipes.sass = function () {
    return gulp.src(paths.sassSrcFile)
        .pipe(plugins.sass().on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', 'IE 8-9']
        }))
        .pipe(gulp.dest(paths.cssDevTarget))
        .pipe(browserSync.stream());
};

//------ Normalize css pipe ------//
pipes.normalize = function () {
    return gulp.src(paths.bower + 'normalize-css/normalize.css')
        .pipe(gulp.dest(paths.cssDevTarget));
};

//------ jQuery.js pipe ------//
pipes.jquery = function () {
    return gulp.src(paths.bower + '/jquery/jquery.js')
        .pipe(gulp.dest(paths.jsDevTarget));
};

//------ Modernizr.js pipe ------//
pipes.modernizr = function () {
    return gulp.src(paths.bower + 'modernizr/modernizr.js')
        .pipe(gulp.dest(paths.jsDevTarget));
};

//------ Placeholder jQuery pipe ------//
pipes.placeholder = function () {
    return gulp.src(paths.bower + 'jquery-placeholder/jquery.placeholder.js')
        .pipe(gulp.dest(paths.jsDevTarget));
};

//------ bPopup.js pipe ------//
pipes.bpopup = function () {
    return gulp.src(paths.bower + 'bPopup/jquery.bpopup.js')
        .pipe(gulp.dest(paths.jsDevTarget));
};

//------ jQuery Validate pipe ------//
pipes.jqValidate = function () {
    return gulp.src(paths.bower + 'jquery-validation/dist/jquery.validate.js')
        .pipe(gulp.dest(paths.jsDevTarget));
};

//------ My scripts pipe ------//
pipes.myScripts = function () {
    return gulp.src(paths.myScriptsSrc)
        .pipe(gulp.dest(paths.jsDevTarget))
        .pipe(browserSync.stream());
};

//------ Images pipe ------//
pipes.images = function () {
    return gulp.src(paths.imagesSrc)
        .pipe(gulp.dest(paths.imagesDevTarget))
        .pipe(browserSync.stream());
};

//------ Fonts pipe ------//
pipes.fonts = function () {
    return gulp.src(paths.fontsSrc)
        .pipe(gulp.dest(paths.fontsDevTarget));
};

//------ Jade pipe ------//
pipes.jade = function () {
    return gulp.src(paths.jadePagesSrc)
        .pipe(plugins.jade({
            pretty: true
        }))
        .pipe(gulp.dest(paths.jadeDevTarget))
        .pipe(browserSync.stream());
};


//--------------------------------------------------------------//
//------ All Tasks ------//


//------ Favicon task ------//
gulp.task('favicon', function () {
    return pipes.favicon();
});

//------ Clean dev path task ------//
gulp.task('clean', function (callback) {
    rimraf(paths.dev, callback);
});


//------ All styles task ------//
gulp.task('styles', function (callback) {
    runSequence('sprite', 'styles:sass', 'styles:normalize', callback);
});

//------ SASS task ------//
gulp.task('styles:sass', function () {
    return pipes.sass();
});

//------ Normalize.css task ------//
gulp.task('styles:normalize', function () {
    return pipes.normalize();
});

//------ Sprite task ------//
gulp.task('sprite', function () {
    var spriteData = gulp.src(paths.spriteSrc).pipe(plugins.spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.scss',
        imgPath: '../img/sprite.png'
    }));

    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(paths.imagesDevTarget));

    var cssStream = spriteData.css
        .pipe(gulp.dest(paths.spriteCssDevTarget));

    return merge(imgStream, cssStream);
});


//------ All js task ------//
gulp.task('js', ['js:jquery', 'js:myScripts', 'js:modernizr', 'js:placeholder', 'js:bpopup', 'js:jqValidate']);

//------ jQuery.js task ------//
gulp.task('js:jquery', function () {
    return pipes.jquery();
});

//------ Modernizr.js task ------//
gulp.task('js:modernizr', function () {
    return pipes.modernizr();
});

//------ Placeholder jQuery task ------//
gulp.task('js:placeholder', function () {
    return pipes.placeholder();
});

//------ bPopup.js task ------//
gulp.task('js:bpopup', function () {
    return pipes.bpopup();
});

//------ jQuery Validate task ------//
gulp.task('js:jqValidate', function () {
    return pipes.jqValidate();
});

//------ My Scripts task ------//
gulp.task('js:myScripts', function () {
    pipes.myScripts();
});


//------ Images task ------//
gulp.task('images', function () {
    return pipes.images();
});


//------ Fonts task ------//
gulp.task('fonts', function () {
    return pipes.fonts();
});


//------ Jade task ------//
gulp.task('jade', function () {
    return pipes.jade();
});


//------ Server browser-sync task ------//
gulp.task('server', function () {
    browserSync({
        port: 9000,
        server: {
            baseDir: paths.dev
        }
    });
});


//------ Watch task ------//
gulp.task('watch', function () {
    gulp.watch(paths.sassSrc, ['styles']);
    gulp.watch(paths.jadeSrc, ['jade']);
    gulp.watch(paths.myScriptsSrc, ['js:myScripts']);
    gulp.watch(paths.imagesSrc, ['images']);
    gulp.watch(paths.spriteSrc, ['styles']);

    gulp.watch([
        paths.dev + '**/*.*'
    ]).on('change', browserSync.reload);
});


//------ Build project to dev task ------//
gulp.task('build', function (callback) {
    runSequence('clean', ['styles', 'js', 'images', 'fonts', 'favicon', 'jade'], callback);
});


//------ Build project to dev and start server task ------//
gulp.task('default', function (callback) {
    runSequence('clean', ['build'], 'server', 'watch', callback);
});


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