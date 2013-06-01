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

/*jslint indent: 2, browser: true, vars: true, nomen: true, plusplus: true, evil: true */
/*global alert, ActiveXObject, DOMParser, XMLSerializer */

var hinclude;

(function () {

  "use strict";

  hinclude = {
    classprefix: "include_",
    move_head_to_document: true, // moved head script into document head
    remove_js: true, // removes script by content

    set_content_async: function (element, req) {
      if (req.readyState === 4) {
        if (req.status === 200 || req.status === 304) {
          element.innerHTML = req.responseText;
          hinclude.hinclude_check_content(element, req.responseText);
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
      if (hinclude.isEmpty(hinclude.buffer)) {
        return false;
      }
      while (hinclude.buffer.length > 0) {
        var include = hinclude.buffer.pop();
        if (include[1].status === 200 || include[1].status === 304) {
          hinclude.hinclude_check_content(include, include[1].responseText);
        }
        include[0].className = hinclude.classprefix + include[1].status;
      }
    },

    outstanding: 0,
    includes: [],
    run: function () {
      var i = 0;
      var mode = this.get_meta("include_mode", "buffered");
      var callback = function (element, req) {};
      this.includes = document.getElementsByTagName("hx:include");
      if (this.includes.length === 0) { // remove ns for IE
        this.includes = document.getElementsByTagName("include");
      }
      if (mode === "async") {
        callback = this.set_content_async;
      } else if (mode === "buffered") {
        callback = this.set_content_buffered;
        var timeout = this.get_meta("include_timeout", 2.5) * 1000;
        setTimeout(hinclude.show_buffered_content, timeout);
      }

      for (i; i < this.includes.length; i += 1) {
        this.include(this.includes[i], this.includes[i].getAttribute("src"), this.includes[i].getAttribute("media"), callback);
      }
    },

    // convert text into xml node
    hinclude_xml_parser_content: function (content) {
      var parsed_document = false;
      if (!hinclude.isEmpty(content)) {
        if (window.ActiveXObject) {// for Internet Explorer
          parsed_document = new ActiveXObject('Microsoft.XMLDOM');
          parsed_document.async = 'false';
          parsed_document.loadXML(content);
          if (parsed_document.parseError.errorCode !== 0) {
            parsed_document = false;
          }
        } else {
          var parser = new DOMParser();
          parsed_document = parser.parseFromString(content, 'text/xml');
          if (parsed_document.getElementsByTagName("parsererror").length > 0) {
            parsed_document = false;
          }
        }
      }
      return parsed_document;
    },

    // verification content hinclude
    hinclude_check_content: function (include, content) {
      var parsed_document = this.hinclude_xml_parser_content(content);
      this.hinclude_check_head_script(parsed_document);
      this.move_html_to_hinclude(include, parsed_document, content);
      var js_onload = this.hinclude_check_onload_body(parsed_document);
      var js_code = this.hinclude_check_js_code(include);
      this.run_hinclude_js(js_onload, js_code);
      this.hinclude_check_child_include(include);
    },

    // verificarion exist head script
    hinclude_check_head_script: function (parsed_document) {
      //xml document
      if (!hinclude.isEmpty(parsed_document)) {
        var head = parsed_document.getElementsByTagName('head');
        if (head.length > 0) {
          var script = head[0].getElementsByTagName('script');
          if (!hinclude.isEmpty(script)) {
            this.hinclude_move_head_script_to_document(script[0]);
          }
        }
      }
    },

    // verification exist onload event
    hinclude_check_onload_body: function (parsed_document) {
      //xml document
      if (!hinclude.isEmpty(parsed_document)) {
        var body = parsed_document.getElementsByTagName('body');
        var onload = false;
        if (body.length > 0) {
          if (!hinclude.isEmpty(body[0].getAttribute('onload'))) {
            onload = body[0].getAttribute('onload');
          }
        }
        return onload;
      }
      return '';
    },

    // moved head script into document head
    hinclude_move_head_script_to_document: function (script) {
      if (script && hinclude.move_head_to_document) {
        var document_head = document.getElementsByTagName('head')[0];
        var document_script = document.createElement('script');
        document_script.type = 'text/javascript';
        try {
          document_script.innerHTML = script.textContent;
        } catch (e) {
          // Internet Explorer
          document_script.text = script.text;
        }
        document_head.appendChild(document_script);
        script.parentNode.removeChild(script);
      }
    },

    // inserts html content into hinclude
    move_html_to_hinclude: function (include, parsed_document, content) {
      var string = '';
      if (!hinclude.isEmpty(parsed_document)) {
        string = this.xml_to_string(parsed_document);
      } else if (!hinclude.isEmpty(content)) {
        string = content;
      }
      include[0].innerHTML = string;
    },

    // convert xml node into string
    xml_to_string: function (parsed_document) {
      try {
        // Gecko-based browsers, Safari, Opera.
        var serialize = (new XMLSerializer()).serializeToString(parsed_document);
        //fix strip closed tag script
        serialize = serialize.replace(/<script([\s\S]*?)\/>/g, '<script$1></script>');
        return serialize;
      } catch (e1) {
        try {
          // Internet Explorer.
          return parsed_document.xml;
        } catch (e2) {
          //Strange Browser ??
          alert('Xmlserializer not supported');
        }
      }
      return false;
    },

    isEmpty: function (value) {
      if (value === null || value === undefined) { return true; }
      if (value.length && value.length > 0) { return false; }
      if (value.length === 0) { return true; }
      var type = typeof value;
      if (type === 'object') {
        var key;
        for (key in value) {
          if (value.hasOwnProperty(key)) {
            return false;
          }
        }
      }
      return true;
    },

    load_js_src_from_content: function (items, iteration) {
      if (!iteration) iteration = 0;
      if (items[iteration]) {
        this.move_jsfile_to_document(
          items[iteration],
          function () {
            hinclude.load_js_src_from_content(items, iteration+1);
          }
        );
      }
    },

    move_jsfile_to_document: function (js_src, callback) {
      if (js_src) {
        var document_head = document.getElementsByTagName('head')[0];
        var document_script = document.createElement('script');
        document_script.type = 'text/javascript';
        document_script.src = js_src;
        if (callback) {
          document_script.onreadystatechange = function () {
            if (this.readyState == 'loaded') callback();
          }
          document_script.onload = callback;
        }
        document_head.appendChild(document_script);
      }
    },

    // verification exists child hinclude
    child_includes: [],
    hinclude_check_child_include: function (include) {
      if (!hinclude.isEmpty(include)) {
        var i = 0;
        var mode = this.get_meta("include_mode", "buffered");
        var callback = function (element, req) {};
        this.child_includes = include[0].getElementsByTagName("hx:include");
        if (this.child_includes.length === 0) { // remove ns for IE
          this.child_includes = include[0].getElementsByTagName("include");
        }
        if (mode === "async") {
          callback = this.set_content_async;
        } else if (mode === "buffered") {
          callback = this.set_content_buffered;
          var timeout = this.get_meta("include_timeout", 2.5) * 1000;
          setTimeout(hinclude.show_buffered_content, timeout);
        }
        for (i; i < this.child_includes.length; i += 1) {
          this.include(this.child_includes[i], this.child_includes[i].getAttribute("src"), this.child_includes[i].getAttribute("media"), callback);
        }
      }
    },

    // verification exists scripts into content
    hinclude_check_js_code: function (include) {
      var js_code = '';
      if (!hinclude.isEmpty(include)) {
        var js = include[0].getElementsByTagName("script");
        if (js.length > 0) {
          var code = '';
          var i = 0;
          var js_src = [];
          for (i; i < js.length; i++) {
            if (js[i].src) {
              js_src.push(js[i].src);
            } else {
              code = js[i].innerHTML;
              js_code = js_code + code;
            }
          }
          this.load_js_src_from_content(js_src);
          this.hinclude_remove_tag_script(js);
        }
      }
      return js_code;
    },

    // removes script by content
    hinclude_remove_tag_script: function (js) {
      if (!hinclude.isEmpty(js) && hinclude.remove_js) {
        var i = 0;
        for (i; i < js.length; i++) {
          js[i].parentNode.removeChild(js[i]);
          i--;
        }
      }
    },

    // execute code js
    run_hinclude_js: function (js_onload, js_code) {
      if (!hinclude.isEmpty(js_code)) {
        eval(js_code);
      }
      if (!hinclude.isEmpty(js_onload)) {
        eval(js_onload);
      }
    },

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

    refresh: function (element_id) {
      var i = 0;
      var mode = this.get_meta("include_mode", "buffered");
      var callback = function (element, req) {};
      callback = this.set_content_buffered;
      for (i; i < this.includes.length; i += 1) {
        if (this.includes[i].getAttribute("id") === element_id) {
          this.include(this.includes[i], this.includes[i].getAttribute("src"), callback);
        }
      }
    },

    get_meta: function (name, value_default) {
      var metas = document.getElementsByTagName("meta");
      if (!hinclude.isEmpty(metas)) {
        var m = 0;
        for (m; m < metas.length; m += 1) {
          var meta_name = metas[m].getAttribute("name");
          if (meta_name === name) {
            return metas[m].getAttribute("content");
          }
        }
      }
      return value_default;
    },

    /*
     * (c)2006 Dean Edwards/Matthias Miller/John Resig
     * Special thanks to Dan Webb's domready.js Prototype extension
     * and Simon Willison's addLoadEvent
     *
     * For more info, see:
     * http://dean.edwards.name/weblog/2006/06/again/
     *
     * Thrown together by Jesse Skinner (http://www.thefutureoftheweb.com/)
     */
    addDOMLoadEvent: function (func) {
      if (!window.__load_events) {
        var init = function () {
          var i = 0;
          // quit if this function has already been called
          if (hinclude.addDOMLoadEvent.done) {
            return;
          }
          hinclude.addDOMLoadEvent.done = true;
          if (window.__load_timer) {
            clearInterval(window.__load_timer);
            window.__load_timer = null;
          }
          for (i; i < window.__load_events.length; i += 1) {
            window.__load_events[i]();
          }
          window.__load_events = null;
          // clean up the __ie_onload event
          /*@cc_on
          document.getElementById("__ie_onload").onreadystatechange = "";
          @*/
        };
        // for Mozilla/Opera9
        if (document.addEventListener) {
          document.addEventListener("DOMContentLoaded", init, false);
        }
        // for Internet Explorer
        /*@cc_on
        document.write(
          "<scr"
            + "ipt id=__ie_onload defer src=javascript:void(0)><\/scr"
            + "ipt>"
        );
        var script = document.getElementById("__ie_onload");
        script.onreadystatechange = function () {
          if (this.readyState === "complete") {
            init(); // call the onload handler
          }
        };
        @*/
        // for Safari
        if (/WebKit/i.test(navigator.userAgent)) { // sniff
          window.__load_timer = setInterval(function () {
            if (/loaded|complete/.test(document.readyState)) {
              init();
            }
          }, 10);
        }
        // for other browsers
        window.onload = init;
        window.__load_events = [];
      }
      window.__load_events.push(func);
    }
  };

  hinclude.addDOMLoadEvent(function () { hinclude.run(); });
}());

