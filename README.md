# gulp-resource-timestamp

### Search for specified graphic resources in javaScript file, for example '/images/file-name.png'

### And adds ?[timestamp] for example '/images/file-name.png?1493982000'

## Install

Install with [npm](https://www.npmjs.com/package/gulp-resource-timestamp)

```
npm install --save gulp-resource-timestamp
```

## Example

```js
var gulp = require('gulp');
var gulpResourceTimestamp = require('gulp-resource-timestamp');

gulp.task('taskName', function () {
    gulp.src('src/app.js')
        .pipe(gulpResourceTimestamp(__dirname + '/web-site-public-dir', 'images-dir-name', ['png', 'jpg']))
        .pipe(gulp.dest('destination-dir'));
});
```

Please notice, that if you have multiple image files that renders for example with VueJS like the following

```js
<img v-for="ix in 9" :src="'/images/name-' + ix + '.png'" alt="Anna is my love" />
```

- Than file images indexes has to be placed at and of file name.
- There has to be file with index between 0 and 99. And at least 1 file with index 100 to 199 so that the search continues.
- The variable for iterations has to be at least 2 letters long, so i or n would not work.
- Timestamp will be found from the file with latest update, so change of any file will excite the change of timestamp value.

## Options

- web-site-public-dir

`requires` : the directory where all your resources are located

- images-dir-name

`default images` : the directory in web-site-public-dir where all images are located

- formats-array

`default ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'svg']` : formats of resources file for search inside javaScript

## License

MIT [@WitalijKaa](http://github.com/WitalijKaa)
