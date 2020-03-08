// First, we'll just include gulp itself.
const gulp = require('gulp');

// Include Our Plugins
const jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    terser = require('gulp-terser'),
    addSrc = require('gulp-add-src'),
    cleany = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel');
const reporterFn = function (results, data, opts = {}) {
    const errLen = results.filter(q => q.error.code[0] == 'E').length,
        warnLen = results.filter(q => q.error.code[0] == 'W').length;
    let str = '',
        prevfile;

    // opts = opts || {};

    results.forEach(function (result) {
        var file = result.file;
        var error = result.error;

        if (prevfile && prevfile !== file) {
            str += "\n";
        }
        prevfile = file;
        if (error.code[0] == 'E') {
            str += 'ERR: ';
        } else if (error.code[0] == 'W' && error.reason != 'Missing semicolon.') {
            str += 'WARN: ';
        } else if (error.code[0] == 'W' && error.reason == 'Missing semicolon.') {
            str += 'Semicolon: ';
        }
        // str += error.code[0]=='E'?chalk.red('ERR:'):chalk.yellow("WARN:")
        str += `${file}: line ${error.line}, col ${error.character} - ${error.reason}`;
        // str += file + ': line ' + error.line + ', col ' + error.character + ', ' + error.reason + 'FULL ERR:' + JSON.stringify(error);

        if (opts.verbose) {
            str += ' (' + error.code + ')';
        }

        str += '\n';
    });

    if (str) {
        console.log(`${str}\n ${errLen} ${"error" + (errLen === 1 ? '' : 's')},  ${warnLen} ${"warning" + (warnLen === 1 ? '' : 's')}`)
        // console.log(str + "\n" + len + ' error' + ((len === 1) ? '' : 's'));
    }
    // console.log('NOT SURE WHERE THIS GOES!')
}
// Lint Task
gulp.task('lint', function () {
    let alreadyRan = false,
        semisDone = false;
    return gulp.src(['src/js/custom/*.js','src/js/custom/**/*.js'])
        .pipe(jshint({
            esversion: 8
        }))
        .pipe(jshint.reporter(reporterFn));
});

gulp.task('sass', function () {
    return gulp.src('src/scss/*.scss')
        .pipe(sass())
        .pipe(concat('styles.css'))
        .pipe(cleany())
        .pipe(gulp.dest('out/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
    return gulp.src(['src/js/custom/*.js','src/js/custom/**/*.js'])
        // .pipe(concat('allCust.js'))
        // .pipe(iife())
        // .pipe(gulp.dest('public/js'))
        .pipe(babel({
            presets: [
                [
                    "@babel/preset-env",
                    {
                        useBuiltIns: "entry",
                        corejs: 3,
                        targets: {
                            firefox: "64", // or whatever target to choose .    
                        },
                      }
                ]
            ]
        }))
        .pipe(terser())
        .pipe(addSrc.prepend(['src/js/libs/*.js']))
        .pipe(concat('all.js'))
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('out/js'));
});
// Watch Files For Changes
gulp.task('watch', function () {
    // let alreadyRan = false;
    // drawTitle('Watching Front-End scripts, Back-End Scripts, and CSS', true)
    gulp.watch(['src/js/custom/*.js','src/js/custom/**/*.js'], gulp.series('lint', 'scripts'));
    gulp.watch(['src/scss/*.scss'], gulp.series('sass'));
});

//task to simply create everything without actually watching or starting the DB
gulp.task('render', gulp.series('lint', 'scripts','sass'))

// Default Task
gulp.task('default', gulp.series('lint', 'scripts', 'sass','watch'));
