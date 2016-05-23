// Include gulp
var gulp = require('gulp');

// Include plugins
var fileinclude = require('gulp-file-include');
var rename = require('gulp-rename');
var images = require('gulp-imagemin');
var cache = require('gulp-cache');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var notify = require('gulp-notify');
var sendmail = require('gulp-mailgun');
var litmus = require('gulp-litmus');
var runSequence = require('run-sequence');
var del = require('del');

var litmusConfig = {
    username: 'litmus_username',
    password: 'litmus_password',
    url: 'https://yourcompany.litmus.com',
    applications: [
        'android4', // Android 4.4
        'androidgmailapp', // Gmail App (Android)
        'appmail9', // Apple Mail 9
        'chromegmailnew', // Gmail (Chrome)
        'outlookcom', // Outlook.com (Explorer)
        'chromeoutlookcom',  // Outlook.com (Chrome)
        'ffgmailnew', // Gmail (Firefox)
        'gmailnew', // Gmail (Explorer)
        'iphone6' // iPhone 6
    ]
};

// Default Task
gulp.task('default', function(cb) {
  runSequence('clean', ['fileinclude', 'images', 'browser-sync', 'sendmail', 'litmus-test', 'watch'], cb);
});

// Tasks

// Clean 'dist'
gulp.task('clean', function() {
  return del(['dist/*.html', 'dist/img']);
});

// Include partial files into email template
gulp.task('fileinclude', function() {
  // grab 'template'
  gulp.src('templates/layouts/*.tpl.html')

  // include partials
  .pipe(fileinclude({
    basepath: 'templates/components/'
  }))

  // remove .tpl.html extension name
  .pipe(rename({
    extname: ""
  }))

  // add new extension name
  .pipe(rename({
    extname: ".html"
  }))

  // move file to folder
  .pipe(gulp.dest('dist/'))

  // notify to say the task has complete
  .pipe(notify({
    message: 'Template file includes complete'
  }))
});

// Compress images
gulp.task('images', function() {
  gulp.src('templates/img/*.{gif,jpg,png}')
  .pipe(cache(images({
    optimizationLevel: 4,
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest('dist/img/'))

  // notify to say the task has complete
  .pipe(notify({
    message: 'Images task complete'
  }))
});

// Reload browser
gulp.task('reload', function () {
  browserSync.reload();
});

// Prepare Browser-sync
gulp.task('browser-sync', function() {
  browserSync.init(['templates/*/*.html'], {
  //proxy: 'your_dev_site.url'
    server: {
        baseDir: './dist/'
    }
  });
});

// Send test emails
// https://www.npmjs.com/package/gulp-mailgun
gulp.task('sendmail', function () {
  gulp.src( 'dist/*.html') // Modify this to select the HTML file(s)
  .pipe(sendmail({
    key: 'Enter your Mailgun API key here', // Enter your Mailgun API key here
    sender: 'from@test.com', // Enter sender email address
    recipient: 'to@test.com', // Enter recipient email address
    subject: 'Outline Mail - Test email' // Enter email subject line
  }))

  // notify to say the task has complete
  .pipe(notify({
    message: 'Send email is task complete'
  }))
});

// Send specified email to Litmus to test various email clients
// Add this to 'default' task if you have a litmus account
gulp.task('litmus-test', function () {
  return gulp.src('dist/*.html') // Modify this to select the HTML file(s)
    .pipe(litmus(litmusConfig))
    .pipe(gulp.dest('dist'));
});

// Watch files for changes
gulp.task('watch', function() {
  gulp.watch(['templates/components/**/*.html'], ['fileinclude']);
  gulp.watch(['templates/layouts/*.tpl.html'], ['fileinclude']);
  gulp.watch(['*.html'], ['reload']);
  gulp.watch(['*.tpl.html'], ['reload']);
  gulp.watch('templates/img/*' , ['images']);
});