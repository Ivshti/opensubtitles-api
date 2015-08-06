var OS = require('./opensubtitles.js'),
    libhash = require('./hash.js'),
    Q = require('q'),
    _ = require('lodash');

var LibSearch = function () {
    this.api = new OS();
};

LibSearch.prototype.optimizeQueryTerms = function (input) {
    var defer = Q.defer(), 
        tmpObj, 
        i = 0, 
        output = [];

    // first data call
    if (input.hash || input.path) {
        tmpObj = {};

        // get hash if path exists
        if (!input.hash && input.path) {
            libhash.computeHash(function (error, response) {
                if (!error && response) {
                    tmpObj.moviehash = response;
                }
            }, input.path);
        }

        // use only what we have
        if (input.hash) {
            tmpObj.moviehash = input.hash;
        }

        if (tmpObj.moviehash && input.filesize) {
            tmpObj.moviebytesize = input.filesize;
        }

        // push
        if (Object.keys(tmpObj).length > 0) {
            output[i] = tmpObj;
            i++;
         }
    }

    // second data call
    if (input.filename) {
        output[i] = {};
        output[i].tag = input.filename;
        i++;
    }

    // third data call
    if (input.imdbid) {
        output[i] = {};
        output[i].imdbid = input.imdbid.toString().replace('tt', '');

        if (input.season && input.episode) {
            output[i].season = input.season;
            output[i].episode = input.episode;
        }
        i++;
    }

    // fallback
    if (!input.imdbid && !input.hash && !input.path && !input.filename && input.query) {
        output[i] = {};
        output[i].query = input.query;

        if (input.season && input.episode) {
            output[i].season = input.season;
            output[i].episode = input.episode;
        }
        i++;
    }

    _.each(output, function (obj) {
        // mandatory parameter
        obj.sublanguageid = input.sublanguageid || 'all';
    });

    defer.resolve(output);

    return defer.promise;
};

LibSearch.prototype.optimizeSubs = function (response) {
    // based on OpenSRTJS, under MIT - Copyright (c) 2014 Eóin Martin
    var defer = Q.defer(),
        subtitles = {};

    _.each(response, function (sub) {

        if (sub.SubFormat !== 'srt') {
            return;
        }

        // imdbid check
        if (response.imdbid) {
            if (sub.SeriesIMDBParent && parseInt(sub.SeriesIMDBParent, 10) !== parseInt(response.imdbid.toString().replace('tt', ''), 10)) {
                return;
            }
            if (sub.IDMovieImdb && parseInt(sub.IDMovieImdb, 10) !== parseInt(response.imdbid.toString().replace('tt', ''), 10)) {
                return;
            }
        }

        // episode check
        if (response.season && response.episode) {
            if (sub.SeriesSeason !== response.season) {
                return;
            }
            if (sub.SeriesEpisode !== response.episode) {
                return;
            }
        }

        var tmp = {};
        tmp.url = sub.SubDownloadLink.replace('.gz', '.srt');
        tmp.lang = sub.ISO639;
        tmp.downloads = sub.SubDownloadsCnt;
        tmp.score = 0;

        if (sub.MatchedBy === 'moviehash') {
            tmp.score += 9;
        }
        if (sub.MatchedBy === 'tag') {
            tmp.score += 8;
        }
        if (sub.MatchedBy === 'imdbid') {
            tmp.score += 6;
        }
        if (sub.UserRank === 'trusted' || sub.UserRank === 'administrator') {
            tmp.score += 5;
        }
        if (sub.UserRank === 'platinum member' || sub.UserRank === 'gold member') {
            tmp.score += 4;
        }

        if (!subtitles[tmp.lang]) {
            subtitles[tmp.lang] = tmp;
        } else {
            // If score is 0 or equal, sort by downloads
            if (tmp.score > subtitles[tmp.lang].score || (tmp.score === subtitles[tmp.lang].score && tmp.downloads > subtitles[tmp.lang].downloads)) {
                subtitles[tmp.lang] = tmp;
            }
        }
    });
    defer.resolve(subtitles);

    return defer.promise;
};

LibSearch.prototype.multiCalls = function (token, optimizedQueryTerms) {
    var defer = Q.defer();
    var self = this;
    var k = 1;
    var results = [];

    _.each(optimizedQueryTerms, function (query) {
        self.api.SearchSubtitles(function (error, response) {
            if (error) {
                defer.reject(error);
            }
            var subs = response.data ? response.data : [];
            _.extend(results, subs);
            if (k === optimizedQueryTerms.length) {
                defer.resolve(results);
            } else {
                k++;
            }

        }, token, [query]);
    });

    return defer.promise;
};

LibSearch.prototype.bestMatch = function (queryTerms) {
    var defer = Q.defer(),
        self = this;

    this.optimizeQueryTerms(queryTerms)
        .then(function (optimizedQueryTerms) {
            // query
            self.multiCalls(queryTerms.token, optimizedQueryTerms)
                .then(function (results) {
                // build our output
                self.optimizeSubs(results)
                    .then(function (subtitles) {
                        defer.resolve(subtitles);
                    });
                });
        });

    return defer.promise;
};

module.exports = new LibSearch();
