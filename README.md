# opensubtitles-api

OpenSubtitles.org api wrapper for downloading subtitles.

- This code is registered under GPLv3 - Copyright (c) 2015  Popcorn Time and the contributors (popcorntime.io)

------

## Quick start

    npm install opensubtitles-api

Then:

```js
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS('UserAgent', 'Username', 'Password');
```

*You can omit username and password to use OpenSubtitles.org anonymously (not all methods are available)*

------

## Examples:

A simple login:

```js
OpenSubtitles.login()
    .then(function(token){
        console.log(token)
    })
    .catch(function(err){
        console.log(err)
    });
```

will return: `6l89visrt089tqsm0qh4trbno6`

NOTE: The `login()` call is useful to verify "Username" and "Password" (if you get a token, you're authentified, as simple as that), but is never needed, all calls are made by the module itself.

------

Get in touch with OpenSubtitles.org API directly (bypass the custom functions of the module):

```js
// OpenSubtitles.api.method for raw xml-rpc capabilities
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS('UserAgent');

OpenSubtitles.api.LogIn('username', 'password', 'en', 'UserAgent')
    .then( // do stuff...
```

NOTE: All methods should be supported. You can consult `./lib/opensubtitles.js` for the list of available calls and the required parameters.

------

Search the best subtitles in all languages for a given movie/episode:

```
OpenSubtitles.search({
    sublanguageid: 'fr'         // Can be an array.join, 'all', or be omitted.
    hash: '8e245d9679d31e12'    // Size + 64bit checksum of the first and last 64k
    filesize: '129994823'       // Total size, in bytes.
    path: 'foo/bar.mp4'         // Complete path to the video file, it allows
                                //   to automatically calculate 'hash'.
    filename: 'bar.mp4'         // The video file name. Better if extension
                                //   is included
    season: '2'
    episode: '3'
    imdbid: '528809'            // 'tt528809' is fine too.
    query: 'Charlie Chaplin'    // Text-based query, this is not recommended.
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

NOTE: No parameter is mandatory, but at least one is required. The more possibilities you add, the best is your chance to get the best matching subtitles in a large variation of languages.
I don't recommend ever using "query", as it is highly error-prone.

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

-----

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
    along with this program.  If not, see http://www.gnu.org/licenses/ .