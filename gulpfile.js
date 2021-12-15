const gulp = require('gulp'),
    prefix = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    rename = require("gulp-rename"),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    concatCss = require('gulp-concat-css'),
    htmlPartial = require('gulp-html-partial'),
    replace = require('gulp-replace'),
    inject = require('gulp-inject-string'),
    gulpAmpValidator = require('gulp-amphtml-validator'),
    fs = require("fs"),
    sync = require('browser-sync'),
    reload = sync.reload;




//html task
const html = () => {
  return gulp.src('src/templates/**/*.html')
      .pipe(htmlPartial({
        basePath: 'src/templates/includes/',
        tagName: 'partial',
        variablePrefix: '@@'
      }))
      .pipe(gulp.dest('src/html'))
      .pipe(reload({stream: true}));

};

exports.html = html;

// Styles

const style = () => {
  return gulp.src('src/sass/**/*.scss')
      .pipe(plumber())
      .pipe(sass())
      .pipe(prefix('last 4 versions'))
      .pipe(gulp.dest('dist/css/'))
      .pipe(cleanCSS())
      .pipe(rename({suffix: ".min"}))
      .pipe(gulp.dest('dist/css/'))
      .pipe(reload({stream: true}));
};
exports.style = style;

// Inject

const injectAmp = () => {
  let cssContent = fs.readFileSync('dist/css/app.min.css', 'utf8');
  return gulp.src(['src/html/index.html'])
      .pipe(plumber())
      .pipe(inject.after('<style amp-custom>', cssContent))
      // Validate the input and attach the validation result to the "amp" property
      // of the file object.
       .pipe(gulpAmpValidator.validate())
      // Print the validation results to the console.
       .pipe(gulpAmpValidator.format())
      // Exit the process with error code (1) if an AMP validation error
      // occurred.
      .pipe(gulpAmpValidator.failAfterError())
      .pipe(gulp.dest('dist'));
};


exports.injectAmp = injectAmp;





// Copy

const copy = () => {
  return gulp.src([
    'src/fonts/**/*',
    'src/images/**/*',
  ], {
    base: 'src'
  })
      .pipe(gulp.dest('dist'))
      .pipe(sync.stream({
        once: true
      }));
};

exports.copy = copy;


// Server

const server = () => {
  let files = [
    'src/sass/**/*.scss'
  ]
  sync.init(files,{
    ui: false,
    notify: false,
    server: {
      baseDir: 'dist'
    }
  });
};

exports.server = server;

// Watch

const watch = () => {
  gulp.watch('src/templates/**/*.html', gulp.series(html));
  gulp.watch('src/html/**/*.html', gulp.series(injectAmp));
  gulp.watch('src/sass/**/*.scss', gulp.series(style));
  gulp.watch([
    'src/fonts/**/*',
    'src/images/**/*',
  ], gulp.series(copy));
};

exports.watch = watch;

// Default

exports.default = gulp.series(
    gulp.parallel(
        html,
        style,
        copy,
    ),
    gulp.parallel(
        watch,
        server,
        injectAmp
    ),
);