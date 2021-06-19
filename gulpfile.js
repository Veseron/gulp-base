const { src, dest, watch, parallel, series } = require('gulp')
const scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default,
    prefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    del = require('del')

const browserSync = require('browser-sync').create()

function sync() {
    browserSync.init({
        server: {
            baseDir: 'src/'
        }
    })
}

function build() {
    return src([
        'src/css/style.min.css',
        'src/fonts/**/*',
        'src/js/main.min.js',
        'src/*.html'
    ], {base: 'src'})
        .pipe(dest('dist'))
}

function images() {
    return src('src/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function styles() {
    return src('src/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(prefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream())
}

function clearDist() {
    return del('dist')
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'src/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js'))
        .pipe(browserSync.stream())
}

function watching() {
    watch(['src/scss/**/*.scss'], styles)
    watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts)
    watch(['src/*.html']).on('change', browserSync.reload)
}

exports.styles = styles
exports.watching = watching
exports.sync = sync
exports.scripts = scripts
exports.images = images
exports.clearDist = clearDist

exports.build = series(clearDist, images, build)
exports.default = parallel(styles, scripts, sync, watching)