var OS = require('./opensubtitles.js'),
    libhash = require('./hash.js'),
    Q = require('q'),
    _ = require('lodash');

var LibSearch = function () {
    this.api = new OS();
}

LibSearch.prototype.optimizeQueryTerms = function (input) {
    var defer = Q.defer();

    var output = {};

    // mandatory
    output.sublanguageid = input.sublanguageid || 'all';

    if (input.hash) {
        output.moviehash = input.hash;
    } else if (input.imdbid) {
        output.imdbid = input.imdbid.replace('tt', '');
        if (input.season && input.episode) {
            output.season = input.season;
            output.episode = input.episode;
        }
    } else {
        output.tag = input.filename;
    }
    defer.resolve(output);

    return defer.promise;
}

LibSearch.prototype.optimizeSubs = function (response) {
    var defer = Q.defer();

    var subtitles = {};

    _.each(response, function (sub) {

        if (sub.SubFormat !== 'srt') {
            return;
        }

        // episode check
        if (response.season && response.episode) {
            if (parseInt(sub.SeriesIMDBParent, 10) !== parseInt(response.imdbid.replace('tt', ''), 10)) {
                return;
            }
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
            tmp.score += 100;
        }
        if (sub.MatchedBy === 'tag') {
            tmp.score += 50;
        }
        if (sub.UserRank === 'trusted') {
            tmp.score += 100;
        }
        if (!subtitles[tmp.lang]) {
            subtitles[tmp.lang] = tmp;
        } else {
            // If score is 0 or equal, sort by downloads
            if (tmp.score > subtitles[tmp.lang].score || (tmp.score === subtitles[tmp.lang].score && tmp.downloads > subtitles[tmp.lang].score.downloads)) {
                subtitles[tmp.lang] = tmp;
            }
        }
    });
    defer.resolve(subtitles);

    return defer.promise;
};


LibSearch.prototype.bestMatch = function (queryTerms) {
    var self = this;
    var defer = Q.defer();

    this.optimizeQueryTerms(queryTerms)
        .then(function (optimizedQueryTerms) {
        self.api.SearchSubtitles(function (error, response) {
            if (error || response.data === false) {
                if (queryTerms.recheck !== true && optimizedQueryTerms.imdbid) {
                    return defer.reject(new Error(error || 'No result'));
                } else {
                    return defer.reject(new Error(error || 'Unable to extract subtitle'));
                }
            }

            // build our output
            self.optimizeSubs(response.data)
                .then(function (subtitles) {
                return defer.resolve(subtitles);
            });

        }, queryTerms.token, [optimizedQueryTerms]);
    });

    return defer.promise;
};

module.exports = new LibSearch();