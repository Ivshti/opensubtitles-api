# opensubtitles-api

**OpenSubtitles.org api wrapper for downloading and uploading subtitles.**

Based on Promises and thus working asynchronously (thanks to Bluebird), this module uses XML-RPC (thanks to xmlrpc) to communicate with OpenSubtitles through HTTPS using Node.js

In addition of allowing to use all available methodCalls asynchronously, it also allows you to directly use powerfull custom calls, like: 

- `search`: Chained function returning the best matching subtitles based on the information you can feed it.
- `upload`: Chained function requiring only the path to the video and to the subtitle files to send new subtitles to OpenSubtitles.org (flow: LogIn > TryUploadSubtitles > UploadSubtitles)

*More complete docs are available on [OpenSubtitles](http://trac.opensubtitles.org/projects/opensubtitles)*

------

## Quick start

    npm install opensubtitles-api

Then:

```js
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS('UserAgent', 'Username', 'Password');
```

*You can omit username and password to use OpenSubtitles.org anonymously (not all methods are available)*

*NOTE: 'Password' can be a MD5 encrypted string, OpenSubtitles accept these. It is recommended to use it. You can get the MD5 of a PASSWORD string by doing: `require('crypto').createHash('md5').update(PASSWORD).digest('hex');`*

------

## Examples:

### A simple login:

```js
OpenSubtitles.login()
    .then(function(response){
        console.log(response);
    })
    .catch(function(err){
        console.log(err);
    });
```

If successful, will return:

```js
Object {
    token: "8qnesekc42g8kj1d58i6fonm61"
    status: "200 OK"
    seconds: 0.031
}
```

*NOTE: The `login()` call is useful to verify "Username" and "Password" (if you get a token, you're authentified, as simple as that), but is never needed, all calls (search, upload) are made by the module itself.*

------

### Get in touch with OpenSubtitles.org API directly:

```js
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS('UserAgent');

OpenSubtitles.api.LogIn('username', 'password', 'en', 'UserAgent')
    .then( // do stuff...
```

*NOTE: All methods should be supported. You can consult `./lib/opensubtitles.js` for the list of available calls and the required parameters.*

------

### Search the best subtitles in all languages for a given movie/episode:

```js
OpenSubtitles.search({
    sublanguageid: 'fr',        // Can be an array.join, 'all', or be omitted.
    hash: '8e245d9679d31e12',   // Size + 64bit checksum of the first and last 64k
    filesize: '129994823',      // Total size, in bytes.
    path: 'foo/bar.mp4',        // Complete path to the video file, it allows
                                //   to automatically calculate 'hash'.
    filename: 'bar.mp4',        // The video file name. Better if extension
                                //   is included
    season: '2',
    episode: '3',
    imdbid: '528809',           // 'tt528809' is fine too.
    query: 'Charlie Chaplin',   // Text-based query, this is not recommended.
}).then(function (subtitles) {
    // an array of objects, no duplicates (ordered by
    // matching + uploader, with total downloads as fallback)
});
```

Example output:

```js
Object {
    ar: "http://dl.opensubtitles.org/download/subtitle_file_id.srt"
    en: "http://dl.opensubtitles.org/download/subtitle_file_id.srt"
    fr: "http://dl.opensubtitles.org/download/subtitle_file_id.srt"
    po: "http://dl.opensubtitles.org/download/subtitle_file_id.srt"
    ru: "http://dl.opensubtitles.org/download/subtitle_file_id.srt"
}
```

*NOTE: No parameter is mandatory, but at least one is required. The more possibilities you add, the best is your chance to get the best matching subtitles in a large variation of languages.*
*I don't recommend ever using "query", as it is highly error-prone.*

Here's how the function prioritize:
1. Hash + filesize (or Path, that will be used to calculate hash and filesize)
2. Filename
3. IMDBid (+ Season and Episode for TV Series)

The function internally ranks the subtitles to get the best match given the info you provided. It works like this:

```
matched by 'hash' and uploaded by:
    + admin|trusted     12
    + platinum|gold     11
    + user|anon         8

matched by tag and uploaded by:
    + admin|trusted     11
    + platinum|gold     10
    + user|anon         7

matched by imdb and uploaded by:
    + admin|trusted     9
    + platinum|gold     8
    + user|anon         5

matched by other and uploaded by:
    + admin|trusted     4
    + platinum|gold     3
    + user|anon         0
```

------

### Upload a subtitle:

```js
OpenSubtitles.upload({
        path: '/home/user/video.avi',       // path to video file
        subpath: '/home/user/video.srt'     // path to subtitle
    })
    .then(function(response){
        console.log(response);
    })
    .catch(function(err){
        console.log(err);
    });
```

Example output (if successfully uploaded):

```js
Object {
    status: '200 OK'
    data: 'http://www.opensubtitles.org/subtitles/123456' //absolute link to subtitles
    seconds: '1.171'
}
```

*NOTE: Only `path` and `subpath` are mandatory. However, it is **highly recommended** to also provide `imdbid` to make sure you can add a subtitle even if the movie isn't already in the database.*

Optionnal parameters are self-explanatory:

- sublanguageid
- highdefinition
- hearingimpaired
- moviereleasename
- movieaka
- moviefps
- movieframes
- movietimems
- automatictranslation
- subauthorcomment

------

## License

This code is registered under GPLv3 - Copyright (c) 2015  Popcorn Time and the contributors (popcorntime.io)

### The GNU GENERAL PUBLIC LICENSE (GPL)

    If you distribute a copy or make a fork of the project, you have to credit this project as source.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/