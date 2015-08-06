### OpenSubtitles API

**Node.js API for downloading subtitles from OpenSubtitles.org**

- This code is registered under GPLv3 - Copyright (c) 2015  Popcorn Time and the contributors (popcorntime.io)

------

### Examples:

```
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS('username', 'password', 'en', 'YourUserAgent');

OpenSubtitles.login()
  .then(function(token){console.log(token)})
  .catch(function(err){console.log(err)});
```
------

```
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS();

OpenSubtitles.getHash('foo/bar.mp4')
    .then(function (hash) {
        console.log(hash);
    });
```

------

```
// OpenSubtitles.api.method for raw xml-rpc capabilities
var OS = require('opensubtitles-api');
var OpenSubtitles = new OS();

OpenSubtitles.api.LogIn(function (err, res, token) {
    console.log(err);
    console.log(res);
    console.log(token);
}, 'username', 'password', 'en', 'UserAgent')
```
------

For the OpenSubtitles.search() function, these parameters are accepted:

```
OpenSubtitles.search({
    sublanguageid: 'fr'         // can be an array.join, 'all', or be omitted.
    hash: '8e245d9679d31e12'    // 'hash' is calculated automa-
    path: 'foo/bar.mp4'         // tically if you also pass 'path'.
    filename: 'bar.mp4'
    season: '2'
    episode: '3'
    imdbid: '528809'            // 'tt528809' is fine too.
    filesize: '129994823'       // total size, in bytes.
    query: 'Charlie Chaplin'
}).then(function (subtitles) {
    // an array of objects, no duplicates, ordered by
    // matching + uploader, with total downloads as fallback
});
```


### The MIT License (MIT)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

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