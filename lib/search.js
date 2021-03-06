var OS = require('./opensubtitles.js'),
    libhash = require('./hash.js'),
    Promise = require('bluebird'),
    _ = require('lodash');

var LibSearch = function () {};

LibSearch.prototype.optimizeQueryTerms = function (input) {
    var checkHash = function () {
        return new Promise(function (resolve, reject) {
            if (!input.hash && !input.path) {
                resolve(false);
            }
            var tmpObj = {};

            if (!input.hash && input.path) {
                // calc hash if path exists
                libhash.computeHash(input.path)
                    .then(resolve)
                    .catch(reject);
            } else {
                tmpObj.moviehash = input.hash;
                if (input.filesize) {
                    tmpObj.moviebytesize = input.filesize;
                }
                resolve(tmpObj)
            }
        });
    };


    return new Promise(function (resolve, reject) {
        var i = 0,
            output = [];

        checkHash().then(function (obj) {
            // first data call
            if (obj) {
                output[i] = obj;
                i++;
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

            // mandatory parameter
            _.each(output, function (obj) {
                obj.sublanguageid = input.sublanguageid || 'all';
            });

            resolve(output);
        }).catch(reject);
    });
};

LibSearch.prototype.optimizeSubs = function (response, input) {
    // based on OpenSRTJS, under MIT - Copyright (c) 2014 Eóin Martin

    return new Promise(function (resolve, reject) {
        var subtitles = {};

        // if string passed as supported extension, convert to array
        if (input.extensions && typeof input.extensions === 'string') {
            input.extensions = [input.extensions];
        }

        // if no supported extensions passed, default to 'srt'
        if (!input.extensions || !input.extensions instanceof Array) {
            input.extensions = ['srt'];
        }

        _.each(response, function (sub) {

            if (input.extensions.indexOf(sub.SubFormat) == -1) {
                return;
            }

            // imdbid check
            if (input.imdbid) {
                // tv episode
                if (sub.SeriesIMDBParent && sub.SeriesIMDBParent.toString() !== '0') {
                    if (parseInt(sub.SeriesIMDBParent, 10) !== parseInt(input.imdbid.toString().replace('tt', ''), 10)) {
                        return;
                    }
                // movie
                } else {
                    if (sub.IDMovieImdb && parseInt(sub.IDMovieImdb, 10) !== parseInt(input.imdbid.toString().replace('tt', ''), 10)) {
                        return;
                    }
                }
            }

            // episode check
            if (input.season && input.episode) {
                if (sub.SeriesSeason !== input.season) {
                    return;
                }
                if (sub.SeriesEpisode !== input.episode) {
                    return;
                }
            }

            var tmp = {};
            tmp.url = sub.SubDownloadLink.replace('.gz', '.'+sub.SubFormat);
            tmp.lang = sub.ISO639;
            tmp.downloads = sub.SubDownloadsCnt;
            tmp.langName = sub.LanguageName;
            tmp.encoding = sub.SubEncoding;
            tmp.score = 0;

            if (sub.MatchedBy === 'moviehash') {
                tmp.score += 8;
            }
            if (sub.MatchedBy === 'tag') {
                tmp.score += 7;
            }
            if (sub.MatchedBy === 'imdbid') {
                tmp.score += 5;
                if (sub.MovieFPS && input.fps && parseInt(sub.MovieFPS) > 0) {
                    if (sub.MovieFPS.startsWith(input.fps) || input.fps.toString().startsWith(sub.MovieFPS)) {
                        tmp.score += 0.5;
                    }
                }
            }
            if (sub.MatchedBy.match(/moviehash|tag|imdbid/) === null) {
                if (sub.MovieFPS && input.fps && parseInt(sub.MovieFPS) > 0) {
                    if (sub.MovieFPS.startsWith(input.fps) || input.fps.toString().startsWith(sub.MovieFPS)) {
                        tmp.score += 2;
                    }
                }
            }
            if (sub.UserRank === 'trusted' || sub.UserRank === 'administrator') {
                tmp.score += 4;
            }
            if (sub.UserRank === 'platinum member' || sub.UserRank === 'gold member') {
                tmp.score += 3;
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

        resolve(subtitles);
    });
};

module.exports = new LibSearch();