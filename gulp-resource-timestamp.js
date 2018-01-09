'use strict';
let through = require('through2'),
    gulpUtil = require('gulp-util'),
    fs = require('fs'),
    PluginError = gulpUtil.PluginError;

const PLUGIN_NAME = 'gulp-resource-timestamp';
const SEARCH_RANGE_LIMIT = 100;

function gulpResourceTimestamp(basePath, imagesDir, targetFormats) {
return through.obj(function (file, enc, cb) { // comments is in russian

    if (file.isStream()) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        return cb();
    }

    if (!imagesDir) { imagesDir = 'images'; }

    if (!targetFormats) {
        targetFormats = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'svg'];
    }

    let i;
    for (i = 0; i < targetFormats.length; i++) {
        targetFormats[i] = '\\.' + targetFormats[i]; // этот слеш-экран добавлен потому что ниже мы делаем (\.png|\.jpg) то есть точка должны быть точкой а не любым символом
    }
    targetFormats = '(' + targetFormats.join('|') + ')';

    // во втором захвате мы ищем либо простую строку-путь после imagesDir либо что-то наподобие '/images/fileName-' + ix + '.png'
    let rExp = new RegExp('(["\']\\/' + imagesDir + '\\/)([^"\'\\n\\r]+?|[^"\'\\n\\r]+?["\']\\s?\\+\\s?[^"\'\\n\\r]{2,}?\\s?\\+\\s?["\'])' + targetFormats + '(["\'])', 'ig');

    let content = String(file.contents).replace(rExp,

        function (match, folder, path, format, end) {

            let getTimestamp = function (filePath) {
                let fileResource = fs.statSync(filePath);
                return Math.round((new Date(fileResource.mtime)).getTime() / 1000);
            };

            let ix;
            let pathForFile = path;
            let isArrayMode = false;

            // если у нас файл из Vue.JS v-for подобной конструкции, например "src": '/images/fileName-' + ix + '.png'
            let quot = pathForFile.indexOf('"');
            if (quot < 0) { quot = pathForFile.indexOf("'"); }
            if (quot > 1) { // то найдем кавычку перед плюсом и запомним вес "статический" путь к массиву файлов
                pathForFile = pathForFile.slice(0, quot);
                isArrayMode = true;
            }

            let filePath;
            let timestamp;

            if (!isArrayMode) {
                filePath = basePath + '/' + imagesDir + '/' + pathForFile + format;
                if (!fs.existsSync(filePath)) { return match; }
                timestamp = getTimestamp(filePath);
            }
            else {
                let fileExists = false;
                let searchRangeStart = 0 - SEARCH_RANGE_LIMIT;
                let searchRangeEnd = 0;
                let highestTimestamp = 0;
                let foundCount = 1;

                while (foundCount > 0) {
                    searchRangeStart += SEARCH_RANGE_LIMIT;
                    searchRangeEnd += SEARCH_RANGE_LIMIT;
                    foundCount = 0;
                    for (ix = searchRangeStart; ix < searchRangeEnd; ix++) {
                        filePath = basePath + '/' + imagesDir + '/' + pathForFile + ix + format;
                        if (fs.existsSync(filePath)) {
                            fileExists = true;
                            foundCount++;
                            let currentTimestamp = getTimestamp(filePath);
                            if (highestTimestamp < currentTimestamp) { highestTimestamp = currentTimestamp; }
                        }
                    }
                }

                if (!fileExists) { return match; }
                timestamp = highestTimestamp;
            }

            return folder + path + format + '?' + timestamp + end;
        }
    );

    file.contents = new Buffer(content);
    this.push(file);
    return cb();
});
}

module.exports = gulpResourceTimestamp;