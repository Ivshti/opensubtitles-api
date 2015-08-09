var OS = require('./lib/opensubtitles.js'),
    libhash = require('./lib/hash.js'),
    libsearch = require('./lib/search.js'),
    libupload = require('./lib/upload.js'),
    Q = require('q');

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
    return Q.Promise(function (resolve, reject) {
        self.api.LogIn(self.credentials.username, self.credentials.password, 'en', self.credentials.useragent)
            .then(function (response) {
                if (response.token) {
                    return resolve(response.token);
                } else {
                    throw new Error(response.status);
                }
            })
            .catch(reject);
    });
};

OpenSubtitles.prototype.search = function (data) {
    var self = this;
    return Q.Promise(function (resolve, reject) {
        self.login()
            .then(function (token) {
                data.token = token;
                return libsearch.bestMatch(self.credentials.useragent, data);
            })
            .then(resolve)
            .catch(reject);
    });
};

OpenSubtitles.prototype.upload = function (data) {
    var self = this;
    return Q.Promise(function (resolve, reject) {
        self.login()
            .then(function (token) {
                data.token = token;
                return libupload.startFlow(self.credentials.useragent, data);
            })
            .then(resolve)
            .catch(reject);
    });
};

OpenSubtitles.prototype.getHash = function (path) {
    return libhash.computeHash(path);
};

OpenSubtitles.prototype.getMD5 = function (path) {
    return libhash.computeMD5(path);
};