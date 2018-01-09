var through = require('through2'),
    gulpUtil = require('gulp-util'),
    fs = require('fs'),
    PluginError = gulpUtil.PluginError;

const PLUGIN_NAME = 'gulp-resource-timestamp';

function gulpResourceTimestamp(basePath, imagesDir, targetFormats) {
return through.obj(function (file, enc, cb) {

    if (file.isStream()) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        return cb();
    }

    if (!imagesDir) { imagesDir = 'images'; }

    if (!targetFormats) {
        targetFormats = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'svg'];
    }

    var i;
    for (i = 0; i < targetFormats.length; i++) {
        targetFormats[i] = '\\.' + targetFormats[i];
    }
    targetFormats = '(' + targetFormats.join('|') + ')';

    var rExp = new RegExp('(["\']\\/' + imagesDir + '\\/)([^"\'\\n\\r]+?|[^"\'\\n\\r].?["\']\\+[^"\'\\n\\r]{2,}?\\+["\'])' + targetFormats + '(["\'])', 'ig');

    var content = String(file.contents).replace(rExp,

        function(match, folder, path, format, end) {

            var pathForFile = path;
            var firstPlus = pathForFile.indexOf(' + ');
            var secondPlus = pathForFile.indexOf(' + ', firstPlus + 4);
            if (firstPlus > 1 && secondPlus > firstPlus) {
                pathForFile = pathForFile.slice(0, firstPlus - 1) + '1' + pathForFile.slice(secondPlus + 4);
            }

            var filePath = basePath + '/' + imagesDir + '/' + pathForFile + format;

            if (!fs.existsSync(filePath)) { return match; }

            var fileResource = fs.statSync(filePath);

            var mtime = new Date(fileResource.mtime);
            var timestamp = Math.round(mtime.getTime()/1000);

            return folder + path + format + '?' + timestamp + end;
        }
    );

    file.contents = new Buffer(content);
    this.push(file);
    return cb();
});
}

module.exports = gulpResourceTimestamp;