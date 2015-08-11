var OS = require('./opensubtitles.js'),
    libhash = require('./hash.js'),
    Q = require('q'),
    path = require('path');
_ = require('lodash');

var LibUpload = function () {};

// Create a valid object from passed info for TryUploadSubtitles
LibUpload.prototype.createTryData = function (input) {

    var checkMovie = function () {
        return Q.Promise(function (resolve, reject) {
            var tmpObj = {};

            if (!input.path) {
                throw new Error('Missing path parameter (path to video file)');
            }

            libhash.computeHash(input.path)
                .then(function (response) {
                    tmpObj = response; // moviebytesize + moviehash
                    tmpObj.moviefilename = path.basename(input.path);
                    resolve(tmpObj);
                })
                .catch(reject);
        });
    };

    var checkSub = function (previousObj) {
        return Q.Promise(function (resolve, reject) {
            var tmpObj = previousObj;

            if (!input.subpath) {
                throw new Error('Missing subpath parameter (path to subtitle file)');
            }

            libhash.computeMD5(input.subpath)
                .then(function (md5) {
                    tmpObj.subhash = md5;
                    tmpObj.subfilename = path.basename(input.subpath);
                    resolve(tmpObj);
                })
                .catch(reject);
        });
    };

    var injectInput = function (previousObj) {
        var tmpObj = previousObj;

        if (input.imdbid) tmpObj.idmovieimdb = input.imdbid.toString().replace('tt', '');
        if (input.sublanguageid) tmpObj.sublanguageid = input.sublanguageid;
        if (input.moviefps) tmpObj.moviefps = input.moviefps;
        if (input.movieframes) tmpObj.movieframes = input.movieframes;
        if (input.movietimems) tmpObj.movietimems = input.movietimems;
        if (input.automatictranslation) tmpObj.automatictranslation = input.automatictranslation;
        if (input.subauthorcomment) tmpObj.subauthorcomment = input.subauthorcomment;
        if (input.highdefinition) tmpObj.highdefinition = input.highdefinition;
        if (input.releasename) tmpObj.moviereleasename = input.releasename;
        if (input.aka) tmpObj.movieaka = input.aka;
        if (input.hearingimpaired) tmpObj.hearingimpaired = input.hearingimpaired;

        return tmpObj;
    };

    // mandatory: subhash (md5 of subtitles), subfilename, moviehash, moviebytesize, moviefilename
    return Q.Promise(function (resolve, reject) {
        checkMovie()
            .then(checkSub)
            .then(injectInput)
            .then(function (data) {
                var arr = {};
                arr.cd1 = data;
                return arr;
            })
            .then(resolve)
            .catch(reject)
    });
};

// Create a valid object for Upload
LibUpload.prototype.arrangeUploadData = function (input) {

    var baseinfo = {
        idmovieimdb: input.idmovieimdb
    };

    if (input.sublanguageid) baseinfo.sublanguageid = input.sublanguageid;
    if (input.automatictranslation) baseinfo.automatictranslation = input.automatictranslation;
    if (input.subauthorcomment) baseinfo.subauthorcomment = input.subauthorcomment;
    if (input.highdefinition) baseinfo.highdefinition = input.highdefinition;
    if (input.releasename) baseinfo.moviereleasename = input.releasename;
    if (input.aka) baseinfo.movieaka = input.aka;
    if (input.hearingimpaired) baseinfo.hearingimpaired = input.hearingimpaired;

    var cd1 = {
        subhash: input.subhash,
        subfilename: input.subfilename,
        moviehash: input.moviehash,
        moviebytesize: input.moviebytesize,
        subcontent: input.subcontent
    };

    if (input.moviefps) cd1.moviefps = input.moviefps;
    if (input.movieframes) cd1.movieframes = input.movieframes;
    if (input.movietimems) cd1.movietimems = input.movietimems;

    return {baseinfo: baseinfo, cd1: cd1};
};

// Read subfile content
LibUpload.prototype.createContent = function (input) {
    var self = this;

    return Q.Promise(function (resolve, reject) {
        libhash.computeSubContent(input.subpath)
            .then(function (base64) {
                input.subcontent = base64;
                resolve(input);
            })
            .catch(reject)
    });
};

// Analyze TryUploadSubtitles response and behave in function
LibUpload.prototype.parseResponse = function (response, input) {
    if (response.data[0]) { // response
        if (response.data[0].IDMovieImdb) { // response & response.imdb
            input.idmovieimdb = response.data[0].IDMovieImdb;
            return input;
        } else { // response & no reponse.imdb
            if (input.idmovieimdb) { // response & no response.imdb but input.imdb
                return input;
            } else { // response & no response.imdb & no input.imdb
                throw new Error('Matching IMDB ID cannot be found');
            }
        }
    } else { // no response
        if (input.idmovieimdb) { // no response but input.imdb
            return input;
        } else { // no response & no input.imdb
            throw new Error('Matching IMDB ID cannot be found');
        }
    }
};

LibUpload.prototype.startFlow = function (useragent, data) {
    var self = this;
    self.call = new OS(useragent);

    return Q.Promise(function (resolve, reject) {
        var persistent_data = {};

        self.createTryData(data)
            .then(function (tryArray) {
                persistent_data = tryArray.cd1;
                return self.call.TryUploadSubtitles(data.token, tryArray);
            })
            .then(function (response) {
                if (response.alreadyindb === 1) {
                    resolve(response); // it exists, don't go further
                } else {
                    persistent_data.subpath = data.subpath; // inject subpath
                    return self.parseResponse(response, persistent_data);
                }
            })
            .then(self.createContent)
            .then(self.arrangeUploadData)
            .then(function (uploadArray) {
                return self.call.UploadSubtitles(data.token, uploadArray);
            })
            .then(resolve)
            .catch(reject)
    });
};

module.exports = new LibUpload();