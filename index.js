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
        if (error || (response && !response.token)) {
            return defer.reject(new Error('No token returned: ' + (response.status || error.message)));
        }
        return defer.resolve(response.token);
    }, this.username, this.password, this.lang, this.useragent);

    return defer.promise;
};

OpenSubtitles.prototype.search = function (data) {
    var self = this;

    return this.login()
        .then(function (token) {
        data.token = token;
        return libsearch.bestMatch(data);
    }).catch(function (error) {
        if (error.message === 'No result') {
            // try another search method
            return libsearch.bestMatch({
                filename: data.filename,
                recheck: true,
                token: data.token
            });
        } else {
            console.log(error)
            return error;
        }
    });
};

OpenSubtitles.prototype.getHash = function (path) {
    var defer = Q.defer();

    libhash.computeHash(function (error, response) {
        if (error || !response) {
            return defer.reject(new Error('Hash computing failed: ' + (error.message || 'no hash returned')));
        }
        return defer.resolve(response);
    }, path);

    return defer.promise;
};