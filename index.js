var OS = require('./lib/opensubtitles.js'),
    libhash = require('./lib/hash.js'),
    libsearch = require('./lib/search.js'),
    libupload = require('./lib/upload.js'),
    Promise = require('bluebird');

var OpenSubtitles = module.exports = function (useragent, username, password) {
    if (!useragent) {
        throw new Error('Missing useragent');
    }

    this.api = new OS(useragent);

    this.credentials = {};
    this.credentials.username = username || '';
    this.credentials.password = password || '';
    this.credentials.useragent = useragent;
};

OpenSubtitles.prototype.login = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.api.LogIn(self.credentials.username, self.credentials.password, 'en', self.credentials.useragent)
            .then(function (response) {
                if (response.token && response.status.match(/200/)) {
                    return resolve(response);
                } else {
                    throw new Error(response.status);
                }
            })
            .catch(reject);
    });
};

OpenSubtitles.prototype.search = function (data) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.login()
            .then(function (response) {
                data.token = response.token;
                return libsearch.bestMatch(self.credentials.useragent, data);
            })
            .then(resolve)
            .catch(reject);
    });
};

OpenSubtitles.prototype.upload = function (data) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var persistent_data = {};

        self.login()
            .then(function (response) {
                data.token = response.token;
                return libupload.createTryData(data);
            })
            .then(function (tryArray) {
                persistent_data = tryArray.cd1;
                return self.api.TryUploadSubtitles(data.token, tryArray);
            })
            .then(function (response) {
                if (response.alreadyindb === 1) {
                    resolve(response); // it exists, don't go further
                } else {
                    persistent_data.subpath = data.subpath; // inject subpath
                    return libupload.parseResponse(response, persistent_data);
                }
            })
            .then(libupload.createContent)
            .then(libupload.arrangeUploadData)
            .then(function (uploadArray) {
                return self.api.UploadSubtitles(data.token, uploadArray);
            })
            .then(function (response) {
                if (response.data !== '' && response.status.match(/200/)) {
                    resolve(response);
                } else {
                    throw new Error(response.status);
                }
            })
            .catch(reject);
    });
};