var xmlrpc = require('xmlrpc');

var OS = module.exports = function () {
    this.client = xmlrpc.createClient({
        host: 'api.opensubtitles.org',
        port: 80,
        path: '/xml-rpc'
    });
};

OS.prototype.call = function (method, args) {
    var callback = args[0],
        array = [];
    delete (args[0]);
    for (var i in args) {
        array.push(args[i]);
    }
    this.client.methodCall(method, array, callback);
};

OS.prototype.LogIn = function (callback, username, password, language, useragent) {
    this.call('LogIn', arguments);
};
OS.prototype.LogOut = function (callback, token) {
    this.call('LogOut', arguments);
};
OS.prototype.SearchSubtitles = function (callback, token, array_queries) {
    this.call('SearchSubtitles', arguments);
};
OS.prototype.SearchToMail = function (callback, token, array_langs, array_movies) {
    this.call('SearchToMail', arguments);
};
OS.prototype.CheckSubHash = function (callback, token, array_subs_hash) {
    this.call('CheckSubHash', arguments);
};
OS.prototype.CheckMovieHash = function (callback, token, array_movies_hash) {
    this.call('CheckMovieHash', arguments);
};
OS.prototype.CheckMovieHash2 = function (callback, token, array_movies_hash) {
    this.call('CheckMovieHash2', arguments);
};
OS.prototype.InsertMovieHash = function (callback, token, array_movies_info) {
    this.call('InsertMovieHash', arguments);
};
OS.prototype.TryUploadSubtitles = function (callback, token, array_sub) {
    this.call('TryUploadSubtitles', arguments);
};
OS.prototype.UploadSubtitles = function (callback, token, array_sub) {
    this.call('UploadSubtitles', arguments);
};
OS.prototype.DetectLanguage = function (callback, token, array_texts) {
    this.call('DetectLanguage', arguments);
};
OS.prototype.DownloadSubtitles = function (callback, token, array_subid) {
    this.call('DownloadSubtitles', arguments);
};
OS.prototype.ReportWrongMovieHash = function (callback, token, IDSubMovieFile) {
    this.call('ReportWrongMovieHash', arguments);
};
OS.prototype.ReportWrongImdbMovie = function (callback, token, array_movie) {
    this.call('ReportWrongImdbMovie', arguments);
};
OS.prototype.GetSubLanguages = function (callback, language) {
    this.call('GetSubLanguages', arguments);
};
OS.prototype.GetAvailableTranslations = function (callback, token, program) {
    this.call('GetAvailableTranslations', arguments);
};
OS.prototype.GetTranslation = function (callback, token, iso639, format, program) {
    this.call('GetTranslation', arguments);
};
OS.prototype.SearchMoviesOnIMDB = function (callback, token, query) {
    this.call('SearchMoviesOnIMDB', arguments);
};
OS.prototype.GetIMDBMovieDetails = function (callback, token, imdbid) {
    this.call('GetIMDBMovieDetails', arguments);
};
OS.prototype.InsertMovie = function (callback, token, array_movie) {
    this.call('InsertMovie', arguments);
};
OS.prototype.SubtitlesVote = function (callback, token, array_vote) {
    this.call('SubtitlesVote', arguments);
};
OS.prototype.GetComments = function (callback, token, array_subids) {
    this.call('GetComments', arguments);
};
OS.prototype.AddComment = function (callback, token, array_comments) {
    this.call('AddComment', arguments);
};
OS.prototype.AddRequest = function (callback, token, array_request) {
    this.call('AddRequest', arguments);
};
OS.prototype.SetSubscribeUrl = function (callback, token, url) {
    this.call('SetSubscribeUrl', arguments);
};
OS.prototype.SubscribeToHash = function (callback, token, array_hashs) {
    this.call('SubscribeToHash', arguments);
};
OS.prototype.AutoUpdate = function (callback, program_name) {
    this.call('AutoUpdate', arguments);
};
OS.prototype.NoOperation = function (callback, token) {
    this.call('NoOperation', arguments);
};
OS.prototype.ServerInfo = function (callback) {
    this.client.methodCall('ServerInfo', [], callback);
};
