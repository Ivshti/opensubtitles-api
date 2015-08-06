var OS = require('./lib/opensubtitles.js'),
    libhash = require('./lib/hash.js'),
    libsearch = require('./lib/search.js'),
    Q = require('q');

var OpenSubtitles = module.exports = function (username, password, lang, useragent) {
    this.api = new OS();
    this.username = username || '';
    this.password = password || '';
    this.lang = lang || 'en';
    this.useragent = useragent;
};

OpenSubtitles.prototype.login = function () {
    var defer = Q.defer();

    this.api.LogIn(function (error, response) {
        if (error || !response || (response && !response.token)) {
            defer.reject(error || new Error('LogIn response: ' + response.status));
        }
        defer.resolve(response.token);
    }, this.username, this.password, this.lang, this.useragent);

    return defer.promise;
};

OpenSubtitles.prototype.search = function (data) {
    var defer = Q.defer();

    this.login()
        .then(function (token) {
            data.token = token;
            libsearch.bestMatch(data)
                .then(function(subtitles) {
                    defer.resolve(subtitles);
                });
        })
        .catch(function (error) {
            defer.reject(error);
        });

    return defer.promise;
};

OpenSubtitles.prototype.getHash = function (path) {
    var defer = Q.defer();

    libhash.computeHash(function (error, response) {
        if (error || !response) {
            defer.reject(error || new Error('No hash returned'));
        }
        defer.resolve(response);
    }, path);

    return defer.promise;
};
