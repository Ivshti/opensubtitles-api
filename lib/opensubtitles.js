var xmlrpc = require('xmlrpc'),
    Promise = require('bluebird');

var OS = module.exports = function (useragent) {
    this.client = xmlrpc.createClient({
        host: 'api.opensubtitles.org',
        port: 80,
        path: '/xml-rpc',
        headers: {
            'User-Agent': useragent
        }
    });
};

OS.prototype.call = function (method, args) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var array = [];
        for (var i in args) {
            array.push(args[i]);
        }
        self.client.methodCall(method, array, function (err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    })
};

OS.prototype.LogIn = function (username, password, language, useragent) {
    return this.call('LogIn', arguments);
};
OS.prototype.LogOut = function (token) {
    return this.call('LogOut', arguments);
};
OS.prototype.SearchSubtitles = function (token, array_queries) {
    return this.call('SearchSubtitles', arguments);
};
OS.prototype.SearchToMail = function (token, array_langs, array_movies) {
    return this.call('SearchToMail', arguments);
};
OS.prototype.CheckSubHash = function (token, array_subs_hash) {
    return this.call('CheckSubHash', arguments);
};
OS.prototype.CheckMovieHash = function (token, array_movies_hash) {
    return this.call('CheckMovieHash', arguments);
};
OS.prototype.CheckMovieHash2 = function (token, array_movies_hash) {
    return this.call('CheckMovieHash2', arguments);
};
OS.prototype.InsertMovieHash = function (token, array_movies_info) {
    return this.call('InsertMovieHash', arguments);
};
OS.prototype.TryUploadSubtitles = function (token, array_sub) {
    return this.call('TryUploadSubtitles', arguments);
};
OS.prototype.UploadSubtitles = function (token, array_sub) {
    return this.call('UploadSubtitles', arguments);
};
OS.prototype.DetectLanguage = function (token, array_texts) {
    return this.call('DetectLanguage', arguments);
};
OS.prototype.DownloadSubtitles = function (token, array_subid) {
    return this.call('DownloadSubtitles', arguments);
};
OS.prototype.ReportWrongMovieHash = function (token, IDSubMovieFile) {
    return this.call('ReportWrongMovieHash', arguments);
};
OS.prototype.ReportWrongImdbMovie = function (token, array_movie) {
    return this.call('ReportWrongImdbMovie', arguments);
};
OS.prototype.GetSubLanguages = function (language) {
    return this.call('GetSubLanguages', arguments);
};
OS.prototype.GetAvailableTranslations = function (token, program) {
    return this.call('GetAvailableTranslations', arguments);
};
OS.prototype.GetTranslation = function (token, iso639, format, program) {
    return this.call('GetTranslation', arguments);
};
OS.prototype.SearchMoviesOnIMDB = function (token, query) {
    return this.call('SearchMoviesOnIMDB', arguments);
};
OS.prototype.GetIMDBMovieDetails = function (token, imdbid) {
    return this.call('GetIMDBMovieDetails', arguments);
};
OS.prototype.InsertMovie = function (token, array_movie) {
    return this.call('InsertMovie', arguments);
};
OS.prototype.SubtitlesVote = function (token, array_vote) {
    return this.call('SubtitlesVote', arguments);
};
OS.prototype.GetComments = function (token, array_subids) {
    return this.call('GetComments', arguments);
};
OS.prototype.AddComment = function (token, array_comments) {
    return this.call('AddComment', arguments);
};
OS.prototype.AddRequest = function (token, array_request) {
    return this.call('AddRequest', arguments);
};
OS.prototype.SetSubscribeUrl = function (token, url) {
    return this.call('SetSubscribeUrl', arguments);
};
OS.prototype.SubscribeToHash = function (token, array_hashs) {
    return this.call('SubscribeToHash', arguments);
};
OS.prototype.AutoUpdate = function (program_name) {
    return this.call('AutoUpdate', arguments);
};
OS.prototype.NoOperation = function (token) {
    return this.call('NoOperation', arguments);
};
OS.prototype.ServerInfo = function () {
    return this.call('ServerInfo', []);
};