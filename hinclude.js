/*
hinclude.js -- HTML Includes (version 0.9.5)

Copyright (c) 2005-2012 Mark Nottingham <mnot@mnot.net>

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

------------------------------------------------------------------------------

See http://mnot.github.com/hinclude/ for documentation.
*/

/*jslint indent: 2, browser: true, vars: true, nomen: true */
/*global alert, ActiveXObject */

var hinclude;

(function () {

  "use strict";

  hinclude = {
    classprefix: "include_",

    set_content_async: function (element, req) {
      if (req.readyState === 4) {
        if (req.status === 200 || req.status === 304) {
          element.innerHTML = req.responseText;
        }
        element.className = hinclude.classprefix + req.status;
      }
    },

    buffer: [],
    set_content_buffered: function (element, req) {
      if (req.readyState === 4) {
        hinclude.buffer.push([element, req]);
        hinclude.outstanding -= 1;
        if (hinclude.outstanding === 0) {
          hinclude.show_buffered_content();
        }
      }
    },

    show_buffered_content: function () {
      var include;
      while (hinclude.buffer.length > 0) {
        include = hinclude.buffer.pop();
        if (include[1].status === 200 || include[1].status === 304) {
          include[0].innerHTML = include[1].responseText;
        }
        include[0].className = hinclude.classprefix + include[1].status;
      }
    },

    outstanding: 0,

    include: function (element, url, media, incl_cb) {
      if (media && window.matchMedia && !window.matchMedia(media).matches) {
        return;
      }
      var scheme = url.substring(0, url.indexOf(":"));
      if (scheme.toLowerCase() === "data") { // just text/plain for now
        var data = decodeURIComponent(url.substring(url.indexOf(",") + 1, url.length));
        element.innerHTML = data;
      } else {
        var req = false;
        if (window.XMLHttpRequest) {
          try {
            req = new XMLHttpRequest();
          } catch (e1) {
            req = false;
          }
        } else if (window.ActiveXObject) {
          try {
            req = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e2) {
            req = false;
          }
        }
        if (req) {
          this.outstanding += 1;
          req.onreadystatechange = function () {
            incl_cb(element, req);
          };
          try {
            req.open("GET", url, true);
            req.send("");
          } catch (e3) {
            this.outstanding -= 1;
            alert("Include error: " + url + " (" + e3 + ")");
          }
        }
      }
    },
    metaCache: {},
    get_meta: function (name, value_default) {

      // Since get_meta is called on each createdCallback, we use caching
      var cached = this.metaCache[name];
      if (cached) {
        return cached;
      }

      var m = 0;
      var metas = document.getElementsByTagName("meta");
      var meta_name, meta_value;
      for (m; m < metas.length; m += 1) {
        meta_name = metas[m].getAttribute("name");
        if (meta_name === name) {
          meta_value = metas[m].getAttribute("content");
          this.metaCache[name] = meta_value;
          return meta_value;
        }
      }
      return value_default;
    }
  };

  var proto = Object.create(window.HTMLElement.prototype);

  proto.createdCallback = function () {

    var mode = hinclude.get_meta("include_mode", "buffered");
    var callback;

    if (mode === "async") {
      callback = hinclude.set_content_async;
    } else if (mode === "buffered") {
      callback = hinclude.set_content_buffered;
      var timeout = hinclude.get_meta("include_timeout", 2.5) * 1000;
      setTimeout(hinclude.show_buffered_content, timeout);
    }

    hinclude.include(this, this.getAttribute("src"), this.getAttribute("media"), callback);
  };

  proto.refresh = function () {
    var callback = hinclude.set_content_buffered;
    hinclude.include(this, this.getAttribute("src"), this.getAttribute("media"), callback);
  };

  document.registerElement('h-include', {
    prototype : proto
  });
}());
