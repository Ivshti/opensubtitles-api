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
    return this.api.LogIn(this.credentials.username, this.credentials.password, 'en', this.credentials.useragent)
        .then(function (response) {
            if (response.token && response.status.match(/200/)) {
                return response;
            } else {
                throw new Error(response.status);
            }
        });
};

OpenSubtitles.prototype.search = function (data) {
    var self = this, 
        subs = [];

    return this.login()
        .then(function (response) {
            data.token = response.token;
            return libsearch.optimizeQueryTerms(data);
        })
        .map(function (optimizedQT) {
            return self.api.SearchSubtitles(data.token, [optimizedQT])
        })
        .each(function (result) {
            subs = subs.concat(result.data);
        })
        .then(function () {
            return libsearch.optimizeSubs(subs, data);
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

OpenSubtitles.prototype.extractInfo = function (path) {
    if (!path) {
        throw new Error('Missing path');
    }
    return libhash.computeHash(path);
};