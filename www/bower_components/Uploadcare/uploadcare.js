/*
 * Uploadcare (2.9.0)
 * Date: 2016-05-13 16:51:44 +0000
 * Rev: 55ded7fe23
 */
;(function(global, factory) {
  // Not a browser enviroment at all: not Browserify/Webpack.
  if ( ! global.document) {
    return;
  }

  if (typeof module === "object" && module.exports) {
    module.exports = factory(global, require("jquery"));
  } else {
    global.uploadcare = factory(global);
  }

}(typeof window !== "undefined" ? window : this, function(window, jQuery) {
  var uploadcare, document = window.document;

(function() {
  uploadcare = {__exports: {}};
  uploadcare.namespace = function(path, fn) {
    var part, target, _i, _len, _ref;
    target = uploadcare;
    if (path) {
      _ref = path.split('.');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        part = _ref[_i];
        target[part] || (target[part] = {});
        target = target[part];
      }
    }
    return fn(target);
  };

  uploadcare.expose = function(key, value) {
    var last, part, parts, source, target, _i, _len;
    parts = key.split('.');
    last = parts.pop();
    target = uploadcare.__exports;
    source = uploadcare;
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      target[part] || (target[part] = {});
      target = target[part];
      source = source != null ? source[part] : void 0;
    }
    return target[last] = value || source[last];
  };

}).call(this);
(function() {
  var expose;

  uploadcare.version = '2.9.0';

  uploadcare.jQuery = jQuery || window.jQuery;

  if (typeof uploadcare.jQuery === 'undefined') {
    throw new ReferenceError('jQuery is not defined');
  }

  expose = uploadcare.expose;

  expose('version');

  expose('jQuery');

  expose('plugin', function(fn) {
    return fn(uploadcare);
  });

}).call(this);
// from https://github.com/jaubourg/ajaxHooks/blob/master/src/xdr.js

if ( window.XDomainRequest ) {
	uploadcare.jQuery.ajaxTransport(function( s ) {
		if ( s.crossDomain && s.async ) {
			if ( s.timeout ) {
				s.xdrTimeout = s.timeout;
				delete s.timeout;
			}
			var xdr;
			return {
				send: function( _, complete ) {
					function callback( status, statusText, responses, responseHeaders ) {
						xdr.onload = xdr.onerror = xdr.ontimeout = function() {};
						xdr = undefined;
						complete( status, statusText, responses, responseHeaders );
					}
					xdr = new XDomainRequest();
					xdr.onload = function() {
						callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
					};
					xdr.onerror = function() {
						callback( 404, "Not Found" );
					};
					xdr.onprogress = function() {};
					xdr.ontimeout = function() {
						callback( 0, "timeout" );
					};
					xdr.timeout = s.xdrTimeout || Number.MAX_VALUE;
					xdr.open( s.type, s.url.replace(/^https?:/, '') );
					xdr.send( ( s.hasContent && s.data ) || null );
				},
				abort: function() {
					if ( xdr ) {
						xdr.onerror = function() {};
						xdr.abort();
					}
				}
			};
		}
	});
}
;
(function() {
  uploadcare.namespace('utils.abilities', function(ns) {
    var ios, url, ver, _ref;
    ns.fileAPI = !!(window.File && window.FileList && window.FileReader);
    ns.sendFileAPI = !!(window.FormData && ns.fileAPI);
    ns.dragAndDrop = (function() {
      var el;
      el = document.createElement("div");
      return ("draggable" in el) || ("ondragstart" in el && "ondrop" in el);
    })();
    ns.canvas = (function() {
      var el;
      el = document.createElement("canvas");
      return !!(el.getContext && el.getContext('2d'));
    })();
    ns.fileDragAndDrop = ns.fileAPI && ns.dragAndDrop;
    ns.iOSVersion = null;
    if (ios = /^[^(]+\(iP(?:hone|od|ad);\s*(.+?)\)/.exec(navigator.userAgent)) {
      if (ver = /OS (\d)_(\d)/.exec(ios[1])) {
        ns.iOSVersion = +ver[1] + ver[2] / 10;
      }
    }
    ns.Blob = false;
    try {
      if (new window.Blob) {
        ns.Blob = window.Blob;
      }
    } catch (_error) {}
    url = window.URL || window.webkitURL || false;
    ns.URL = url && url.createObjectURL && url;
    return ns.FileReader = ((_ref = window.FileReader) != null ? _ref.prototype.readAsArrayBuffer : void 0) && window.FileReader;
  });

}).call(this);
(function() {
  var $,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  $ = uploadcare.jQuery;

  uploadcare.namespace('utils', function(utils) {
    var _ref;
    utils.Collection = (function() {
      function Collection(items) {
        var item, _i, _len;
        if (items == null) {
          items = [];
        }
        this.onAdd = $.Callbacks();
        this.onRemove = $.Callbacks();
        this.onSort = $.Callbacks();
        this.onReplace = $.Callbacks();
        this.__items = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          this.add(item);
        }
      }

      Collection.prototype.add = function(item) {
        return this.__add(item, this.__items.length);
      };

      Collection.prototype.__add = function(item, i) {
        this.__items.splice(i, 0, item);
        return this.onAdd.fire(item, i);
      };

      Collection.prototype.remove = function(item) {
        var i;
        i = $.inArray(item, this.__items);
        if (i !== -1) {
          return this.__remove(item, i);
        }
      };

      Collection.prototype.__remove = function(item, i) {
        this.__items.splice(i, 1);
        return this.onRemove.fire(item, i);
      };

      Collection.prototype.clear = function() {
        var i, item, items, _i, _len, _results;
        items = this.get();
        this.__items.length = 0;
        _results = [];
        for (i = _i = 0, _len = items.length; _i < _len; i = ++_i) {
          item = items[i];
          _results.push(this.onRemove.fire(item, i));
        }
        return _results;
      };

      Collection.prototype.replace = function(oldItem, newItem) {
        var i;
        if (oldItem !== newItem) {
          i = $.inArray(oldItem, this.__items);
          if (i !== -1) {
            return this.__replace(oldItem, newItem, i);
          }
        }
      };

      Collection.prototype.__replace = function(oldItem, newItem, i) {
        this.__items[i] = newItem;
        return this.onReplace.fire(oldItem, newItem, i);
      };

      Collection.prototype.sort = function(comparator) {
        this.__items.sort(comparator);
        return this.onSort.fire();
      };

      Collection.prototype.get = function(index) {
        if (index != null) {
          return this.__items[index];
        } else {
          return this.__items.slice(0);
        }
      };

      Collection.prototype.length = function() {
        return this.__items.length;
      };

      return Collection;

    })();
    utils.UniqCollection = (function(_super) {
      __extends(UniqCollection, _super);

      function UniqCollection() {
        _ref = UniqCollection.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      UniqCollection.prototype.add = function(item) {
        if (__indexOf.call(this.__items, item) >= 0) {
          return;
        }
        return UniqCollection.__super__.add.apply(this, arguments);
      };

      UniqCollection.prototype.__replace = function(oldItem, newItem, i) {
        if (__indexOf.call(this.__items, newItem) >= 0) {
          return this.remove(oldItem);
        } else {
          return UniqCollection.__super__.__replace.apply(this, arguments);
        }
      };

      return UniqCollection;

    })(utils.Collection);
    return utils.CollectionOfPromises = (function(_super) {
      __extends(CollectionOfPromises, _super);

      function CollectionOfPromises() {
        this.onAnyProgress = __bind(this.onAnyProgress, this);
        this.onAnyFail = __bind(this.onAnyFail, this);
        this.onAnyDone = __bind(this.onAnyDone, this);
        this.anyDoneList = $.Callbacks();
        this.anyFailList = $.Callbacks();
        this.anyProgressList = $.Callbacks();
        this.anyProgressList.add(function(item, firstArgument) {
          return $(item).data('lastProgress', firstArgument);
        });
        CollectionOfPromises.__super__.constructor.apply(this, arguments);
      }

      CollectionOfPromises.prototype.onAnyDone = function(cb) {
        var file, _i, _len, _ref1, _results;
        this.anyDoneList.add(cb);
        _ref1 = this.__items;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          file = _ref1[_i];
          if (file.state() === 'resolved') {
            _results.push(file.done(function() {
              return cb.apply(null, [file].concat(__slice.call(arguments)));
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      CollectionOfPromises.prototype.onAnyFail = function(cb) {
        var file, _i, _len, _ref1, _results;
        this.anyFailList.add(cb);
        _ref1 = this.__items;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          file = _ref1[_i];
          if (file.state() === 'rejected') {
            _results.push(file.fail(function() {
              return cb.apply(null, [file].concat(__slice.call(arguments)));
            }));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      CollectionOfPromises.prototype.onAnyProgress = function(cb) {
        var file, _i, _len, _ref1, _results;
        this.anyProgressList.add(cb);
        _ref1 = this.__items;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          file = _ref1[_i];
          _results.push(cb(file, $(file).data('lastProgress')));
        }
        return _results;
      };

      CollectionOfPromises.prototype.lastProgresses = function() {
        var item, _i, _len, _ref1, _results;
        _ref1 = this.__items;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          item = _ref1[_i];
          _results.push($(item).data('lastProgress'));
        }
        return _results;
      };

      CollectionOfPromises.prototype.add = function(item) {
        if (!(item && item.then)) {
          return;
        }
        CollectionOfPromises.__super__.add.apply(this, arguments);
        return this.__watchItem(item);
      };

      CollectionOfPromises.prototype.__replace = function(oldItem, newItem, i) {
        if (!(newItem && newItem.then)) {
          return this.remove(oldItem);
        } else {
          CollectionOfPromises.__super__.__replace.apply(this, arguments);
          return this.__watchItem(newItem);
        }
      };

      CollectionOfPromises.prototype.__watchItem = function(item) {
        var handler,
          _this = this;
        handler = function(callbacks) {
          return function() {
            if (__indexOf.call(_this.__items, item) >= 0) {
              return callbacks.fire.apply(callbacks, [item].concat(__slice.call(arguments)));
            }
          };
        };
        return item.then(handler(this.anyDoneList), handler(this.anyFailList), handler(this.anyProgressList));
      };

      return CollectionOfPromises;

    })(utils.UniqCollection);
  });

}).call(this);
(function() {
  var __slice = [].slice;

  uploadcare.namespace('utils', function(ns) {
    var common, messages;
    ns.log = function() {
      var _ref;
      return (_ref = window.console) != null ? typeof _ref.log === "function" ? _ref.log.apply(_ref, arguments) : void 0 : void 0;
    };
    ns.debug = function() {
      var _ref, _ref1;
      if ((_ref = window.console) != null ? _ref.debug : void 0) {
        return (_ref1 = window.console).debug.apply(_ref1, arguments);
      } else {
        return ns.log.apply(ns, ["Debug:"].concat(__slice.call(arguments)));
      }
    };
    ns.warn = function() {
      var _ref, _ref1;
      if ((_ref = window.console) != null ? _ref.warn : void 0) {
        return (_ref1 = window.console).warn.apply(_ref1, arguments);
      } else {
        return ns.log.apply(ns, ["Warning:"].concat(__slice.call(arguments)));
      }
    };
    messages = {};
    ns.warnOnce = function(msg) {
      if (messages[msg] == null) {
        messages[msg] = true;
        return ns.warn(msg);
      }
    };
    common = {
      publicKey: "Global public key not set. Uploads may not work!\nAdd this to the <head> tag to set your key:\n\n<script>\nUPLOADCARE_PUBLIC_KEY = 'your_public_key';\n</script>"
    };
    return ns.commonWarning = function(name) {
      if (common[name] != null) {
        return ns.warnOnce(common[name]);
      }
    };
  });

}).call(this);
(function() {
  var $;

  $ = uploadcare.jQuery;

  uploadcare.namespace('utils', function(ns) {
    var callbacks,
      _this = this;
    callbacks = {};
    $(window).on("message", function(_arg) {
      var e, item, message, _i, _len, _ref, _results;
      e = _arg.originalEvent;
      try {
        message = JSON.parse(e.data);
      } catch (_error) {
        return;
      }
      if (message.type in callbacks) {
        _ref = callbacks[message.type];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (e.source === item[0]) {
            _results.push(item[1](message));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    });
    ns.registerMessage = function(type, sender, callback) {
      if (!(type in callbacks)) {
        callbacks[type] = [];
      }
      return callbacks[type].push([sender, callback]);
    };
    return ns.unregisterMessage = function(type, sender) {
      if (type in callbacks) {
        return callbacks[type] = $.grep(callbacks[type], function(item) {
          return item[0] !== sender;
        });
      }
    };
  });

}).call(this);
(function() {
  var $,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  $ = uploadcare.jQuery;

  uploadcare.namespace('utils', function(ns) {
    var pipeTuples;
    ns.unique = function(arr) {
      var item, result, _i, _len;
      result = [];
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        item = arr[_i];
        if (__indexOf.call(result, item) < 0) {
          result.push(item);
        }
      }
      return result;
    };
    ns.imageLoader = function(src) {
      var def;
      def = $.Deferred();
      $(new Image).on('load', def.resolve).on('error', def.reject).attr('src', src);
      return def.promise();
    };
    ns.videoLoader = function(src) {
      var def;
      def = $.Deferred();
      $('<video/>').on('loadeddata', def.resolve).on('error', def.reject).attr('src', src).load();
      return def.promise();
    };
    ns.defer = function(fn) {
      return setTimeout(fn, 0);
    };
    ns.gcd = function(a, b) {
      var c;
      while (b) {
        c = a % b;
        a = b;
        b = c;
      }
      return a;
    };
    ns.once = function(fn) {
      var called, result;
      called = false;
      result = null;
      return function() {
        if (!called) {
          result = fn.apply(this, arguments);
          called = true;
        }
        return result;
      };
    };
    ns.wrapToPromise = function(value) {
      return $.Deferred().resolve(value).promise();
    };
    ns.then = function(pr, doneFilter, failFilter, progressFilter) {
      var compose, df;
      df = $.Deferred();
      compose = function(fn1, fn2) {
        if (fn1 && fn2) {
          return function() {
            return fn2.call(this, fn1.apply(this, arguments));
          };
        } else {
          return fn1 || fn2;
        }
      };
      pr.then(compose(doneFilter, df.resolve), compose(failFilter, df.reject), compose(progressFilter, df.notify));
      return df.promise();
    };
    ns.bindAll = function(source, methods) {
      var target;
      target = {};
      $.each(methods, function(i, method) {
        var fn;
        fn = source[method];
        if ($.isFunction(fn)) {
          return target[method] = function() {
            var result;
            result = fn.apply(source, arguments);
            if (result === source) {
              return target;
            } else {
              return result;
            }
          };
        } else {
          return target[method] = fn;
        }
      });
      return target;
    };
    ns.upperCase = function(s) {
      return s.replace(/([A-Z])/g, '_$1').toUpperCase();
    };
    ns.publicCallbacks = function(callbacks) {
      var result;
      result = callbacks.add;
      result.add = callbacks.add;
      result.remove = callbacks.remove;
      return result;
    };
    ns.uuid = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = c === 'x' ? r : r & 3 | 8;
        return v.toString(16);
      });
    };
    ns.splitUrlRegex = /^(?:([^:\/?#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)\??([^\#]*)\#?(.*)$/;
    ns.uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    ns.groupIdRegex = new RegExp("" + ns.uuidRegex.source + "~[0-9]+", 'i');
    ns.cdnUrlRegex = new RegExp("^/?(" + ns.uuidRegex.source + ")(?:/(-/(?:[^/]+/)+)?([^/]*))?$", 'i');
    ns.splitCdnUrl = function(url) {
      return ns.cdnUrlRegex.exec(ns.splitUrlRegex.exec(url)[3]);
    };
    ns.escapeRegExp = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    ns.globRegexp = function(str, flags) {
      var parts;
      if (flags == null) {
        flags = 'i';
      }
      parts = $.map(str.split('*'), ns.escapeRegExp);
      return new RegExp("^" + parts.join('.+') + "$", flags);
    };
    ns.normalizeUrl = function(url) {
      var scheme;
      scheme = document.location.protocol;
      if (scheme !== 'http:') {
        scheme = 'https:';
      }
      return url.replace(/^\/\//, scheme + '//').replace(/\/+$/, '');
    };
    ns.fitText = function(text, max) {
      var head, tail;
      if (text.length > max) {
        head = Math.ceil((max - 3) / 2);
        tail = Math.floor((max - 3) / 2);
        return text.slice(0, head) + '...' + text.slice(-tail);
      } else {
        return text;
      }
    };
    ns.fitSizeInCdnLimit = function(objSize) {
      return ns.fitSize(objSize, [2048, 2048]);
    };
    ns.fitSize = function(objSize, boxSize, upscale) {
      var heightRation, widthRatio;
      if (objSize[0] > boxSize[0] || objSize[1] > boxSize[1] || upscale) {
        widthRatio = boxSize[0] / objSize[0];
        heightRation = boxSize[1] / objSize[1];
        if (!boxSize[0] || (boxSize[1] && widthRatio > heightRation)) {
          return [Math.round(heightRation * objSize[0]), boxSize[1]];
        } else {
          return [boxSize[0], Math.round(widthRatio * objSize[1])];
        }
      } else {
        return objSize.slice();
      }
    };
    ns.applyCropSelectionToFile = function(file, crop, size, coords) {
      var downscale, h, modifiers, prefered, upscale, w, wholeImage,
        _this = this;
      w = coords.width, h = coords.height;
      prefered = crop.preferedSize;
      modifiers = '';
      wholeImage = w === size[0] && h === size[1];
      if (!wholeImage) {
        modifiers += "-/crop/" + w + "x" + h + "/" + coords.left + "," + coords.top + "/";
      }
      downscale = crop.downscale && (w > prefered[0] || h > prefered[1]);
      upscale = crop.upscale && (w < prefered[0] || h < prefered[1]);
      if (downscale || upscale) {
        coords.sw = prefered[0], coords.sh = prefered[1];
        modifiers += "-/resize/" + (prefered.join('x')) + "/";
      } else if (!wholeImage) {
        modifiers += "-/preview/";
      }
      return file.then(function(info) {
        info.cdnUrlModifiers = modifiers;
        info.cdnUrl = "" + info.originalUrl + (modifiers || '');
        info.crop = coords;
        return info;
      });
    };
    ns.fileInput = function(container, settings, fn) {
      var accept, input, run;
      input = null;
      accept = settings.inputAcceptTypes;
      if (accept === '') {
        accept = settings.imagesOnly ? 'image/*' : null;
      }
      (run = function() {
        input = (settings.multiple ? $('<input type="file" multiple>') : $('<input type="file">')).attr('accept', accept).css({
          position: 'absolute',
          top: 0,
          opacity: 0,
          margin: 0,
          padding: 0,
          width: 'auto',
          height: 'auto',
          cursor: container.css('cursor')
        }).on('change', function() {
          fn(this);
          $(this).hide();
          return run();
        });
        return container.append(input);
      })();
      return container.css({
        position: 'relative',
        overflow: 'hidden'
      }).mousemove(function(e) {
        var left, top, width, _ref;
        _ref = $(this).offset(), left = _ref.left, top = _ref.top;
        width = input.width();
        return input.css({
          left: e.pageX - left - width + 10,
          top: e.pageY - top - 10
        });
      });
    };
    ns.fileSelectDialog = function(container, settings, fn) {
      var accept;
      accept = settings.inputAcceptTypes;
      if (accept === '') {
        accept = settings.imagesOnly ? 'image/*' : null;
      }
      return $(settings.multiple ? '<input type="file" multiple>' : '<input type="file">').attr('accept', accept).css({
        position: 'fixed',
        bottom: 0,
        opacity: 0
      }).on('change', function() {
        fn(this);
        return $(this).remove();
      }).appendTo(container).focus().click().hide();
    };
    ns.fileSizeLabels = 'B KB MB GB TB PB EB ZB YB'.split(' ');
    ns.readableFileSize = function(value, onNaN, prefix, postfix) {
      var digits, fixedTo, i, threshold;
      if (onNaN == null) {
        onNaN = '';
      }
      if (prefix == null) {
        prefix = '';
      }
      if (postfix == null) {
        postfix = '';
      }
      value = parseInt(value, 10);
      if (isNaN(value)) {
        return onNaN;
      }
      digits = 2;
      i = 0;
      threshold = 1000 - 5 * Math.pow(10, 2 - Math.max(digits, 3));
      while (value > threshold && i < ns.fileSizeLabels.length - 1) {
        i++;
        value /= 1024;
      }
      value += 0.000000000000001;
      fixedTo = Math.max(0, digits - Math.floor(value).toFixed(0).length);
      value = Number(value.toFixed(fixedTo));
      return "" + prefix + value + " " + ns.fileSizeLabels[i] + postfix;
    };
    ns.ajaxDefaults = {
      dataType: 'json',
      crossDomain: true,
      cache: false
    };
    ns.jsonp = function(url, type, data) {
      if ($.isPlainObject(type)) {
        data = type;
        type = 'GET';
      }
      return $.ajax($.extend({
        url: url,
        type: type,
        data: data
      }, ns.ajaxDefaults)).then(function(data) {
        var text;
        if (data.error) {
          text = data.error.content || data.error;
          return $.Deferred().reject(text);
        } else {
          return data;
        }
      }, function(_, textStatus, errorThrown) {
        var text;
        text = "" + textStatus + " (" + errorThrown + ")";
        ns.warn("JSONP unexpected error: " + text + " while loading " + url);
        return text;
      });
    };
    ns.canvasToBlob = function(canvas, type, quality, callback) {
      var arr, binStr, dataURL, i, _i, _ref;
      if (HTMLCanvasElement.prototype.toBlob) {
        return canvas.toBlob(callback, type, quality);
      }
      dataURL = canvas.toDataURL(type, quality);
      dataURL = dataURL.split(',');
      binStr = atob(dataURL[1]);
      arr = new Uint8Array(binStr.length);
      for (i = _i = 0, _ref = binStr.length; _i < _ref; i = _i += 1) {
        arr[i] = binStr.charCodeAt(i);
      }
      return callback(new Blob([arr], {
        type: /:(.+\/.+);/.exec(dataURL[0])[1]
      }));
    };
    ns.taskRunner = function(capacity) {
      var queue, release, run, running;
      running = 0;
      queue = [];
      release = function() {
        var task;
        if (queue.length) {
          task = queue.shift();
          return ns.defer(function() {
            return task(release);
          });
        } else {
          return running -= 1;
        }
      };
      return run = function(task) {
        if (!capacity || running < capacity) {
          running += 1;
          return ns.defer(function() {
            return task(release);
          });
        } else {
          return queue.push(task);
        }
      };
    };
    pipeTuples = [["notify", "progress", 2], ["resolve", "done", 0], ["reject", "fail", 1]];
    return ns.fixedPipe = function() {
      var fns, promise;
      promise = arguments[0], fns = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return $.Deferred(function(newDefer) {
        return $.each(pipeTuples, function(i, tuple) {
          var fn;
          fn = $.isFunction(fns[tuple[2]]) && fns[tuple[2]];
          return promise[tuple[1]](function() {
            var returned;
            returned = fn && fn.apply(this, arguments);
            if (returned && $.isFunction(returned.promise)) {
              return returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
            } else {
              return newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
            }
          });
        });
      }).promise();
    };
  });

}).call(this);
(function() {
  var $, expose, utils,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  expose = uploadcare.expose, utils = uploadcare.utils, $ = uploadcare.jQuery;

  uploadcare.namespace('settings', function(ns) {
    var arrayOptions, defaults, flagOptions, intOptions, normalize, parseCrop, parseShrink, presets, str2arr, urlOptions;
    defaults = {
      live: true,
      manualStart: false,
      locale: null,
      localePluralize: null,
      localeTranslations: null,
      systemDialog: false,
      crop: false,
      previewStep: false,
      imagesOnly: false,
      clearable: false,
      multiple: false,
      multipleMax: 0,
      multipleMin: 1,
      multipleMaxStrict: false,
      imageShrink: false,
      pathValue: true,
      tabs: 'file camera url facebook gdrive dropbox instagram evernote flickr skydrive',
      preferredTypes: '',
      inputAcceptTypes: '',
      doNotStore: false,
      publicKey: null,
      secureSignature: '',
      secureExpire: '',
      pusherKey: '79ae88bd931ea68464d9',
      cdnBase: 'https://ucarecdn.com',
      urlBase: 'https://upload.uploadcare.com',
      socialBase: 'https://social.uploadcare.com',
      imagePreviewMaxSize: 25 * 1024 * 1024,
      multipartMinSize: 25 * 1024 * 1024,
      multipartPartSize: 5 * 1024 * 1024,
      multipartMinLastPartSize: 1024 * 1024,
      multipartConcurrency: 4,
      multipartMaxAttempts: 3,
      parallelDirectUploads: 10,
      passWindowOpen: false,
      scriptBase: "//ucarecdn.com/widget/" + uploadcare.version + "/uploadcare/",
      debugUploads: false
    };
    presets = {
      tabs: {
        all: 'file camera url facebook gdrive dropbox instagram evernote flickr skydrive box vk huddle',
        "default": defaults.tabs
      }
    };
    str2arr = function(value) {
      if (!$.isArray(value)) {
        value = $.trim(value);
        value = value ? value.split(' ') : [];
      }
      return value;
    };
    arrayOptions = function(settings, keys) {
      var item, key, source, value, _i, _j, _len, _len1;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        value = source = str2arr(settings[key]);
        if (presets.hasOwnProperty(key)) {
          value = [];
          for (_j = 0, _len1 = source.length; _j < _len1; _j++) {
            item = source[_j];
            if (presets[key].hasOwnProperty(item)) {
              value = value.concat(str2arr(presets[key][item]));
            } else {
              value.push(item);
            }
          }
        }
        settings[key] = utils.unique(value);
      }
      return settings;
    };
    urlOptions = function(settings, keys) {
      var key, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (settings[key] != null) {
          settings[key] = utils.normalizeUrl(settings[key]);
        }
      }
      return settings;
    };
    flagOptions = function(settings, keys) {
      var key, value, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (!(settings[key] != null)) {
          continue;
        }
        value = settings[key];
        if ($.type(value) === 'string') {
          value = $.trim(value).toLowerCase();
          settings[key] = !(value === 'false' || value === 'disabled');
        } else {
          settings[key] = !!value;
        }
      }
      return settings;
    };
    intOptions = function(settings, keys) {
      var key, _i, _len;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (settings[key] != null) {
          settings[key] = parseInt(settings[key]);
        }
      }
      return settings;
    };
    parseCrop = function(val) {
      var ratio, reRatio;
      reRatio = /^([0-9]+)([x:])([0-9]+)\s*(|upscale|minimum)$/i;
      ratio = reRatio.exec($.trim(val.toLowerCase())) || [];
      return {
        downscale: ratio[2] === 'x',
        upscale: !!ratio[4],
        notLess: ratio[4] === 'minimum',
        preferedSize: ratio.length ? [+ratio[1], +ratio[3]] : void 0
      };
    };
    parseShrink = function(val) {
      var reShrink, shrink, size;
      reShrink = /^([0-9]+)x([0-9]+)(?:\s+(\d{1,2}|100)%)?$/i;
      shrink = reShrink.exec($.trim(val.toLowerCase())) || [];
      if (!shrink.length) {
        return false;
      }
      size = shrink[1] * shrink[2];
      if (size > 5000000) {
        utils.warnOnce("Shrinked size can not be larger than 5MP. " + ("You have set " + shrink[1] + "x" + shrink[2] + " (") + ("" + (Math.ceil(size / 1000 / 100) / 10) + "MP)."));
        return false;
      }
      return {
        quality: shrink[3] ? shrink[3] / 100 : void 0,
        size: size
      };
    };
    normalize = function(settings) {
      arrayOptions(settings, ['tabs', 'preferredTypes']);
      urlOptions(settings, ['cdnBase', 'socialBase', 'urlBase', 'scriptBase']);
      flagOptions(settings, ['doNotStore', 'imagesOnly', 'multiple', 'clearable', 'pathValue', 'previewStep', 'systemDialog', 'debugUploads', 'multipleMaxStrict']);
      intOptions(settings, ['multipleMax', 'multipleMin', 'multipartMinSize', 'multipartPartSize', 'multipartMinLastPartSize', 'multipartConcurrency', 'multipartMaxAttempts', 'parallelDirectUploads']);
      if (settings.crop !== false && !$.isArray(settings.crop)) {
        if (/^(disabled?|false|null)$/i.test(settings.crop)) {
          settings.crop = false;
        } else if ($.isPlainObject(settings.crop)) {
          settings.crop = [settings.crop];
        } else {
          settings.crop = $.map(('' + settings.crop).split(','), parseCrop);
        }
      }
      if (settings.imageShrink && !$.isPlainObject(settings.imageShrink)) {
        settings.imageShrink = parseShrink(settings.imageShrink);
      }
      if (settings.crop || settings.multiple) {
        settings.previewStep = true;
      }
      if (!utils.abilities.sendFileAPI) {
        settings.systemDialog = false;
      }
      if (settings.validators) {
        settings.validators = settings.validators.slice();
      }
      return settings;
    };
    expose('defaults', $.extend({
      allTabs: presets.tabs.all
    }, defaults));
    ns.globals = function() {
      var key, value, values;
      values = {};
      for (key in defaults) {
        value = window["UPLOADCARE_" + (utils.upperCase(key))];
        if (value !== void 0) {
          values[key] = value;
        }
      }
      return values;
    };
    ns.common = utils.once(function(settings, ignoreGlobals) {
      var result;
      if (!ignoreGlobals) {
        defaults = $.extend(defaults, ns.globals());
      }
      result = normalize($.extend(defaults, settings || {}));
      if (!result.publicKey) {
        utils.commonWarning('publicKey');
      }
      ns.waitForSettings.fire(result);
      return result;
    });
    ns.build = function(settings) {
      var result;
      result = $.extend({}, ns.common());
      if (!$.isEmptyObject(settings)) {
        result = normalize($.extend(result, settings));
      }
      return result;
    };
    ns.waitForSettings = $.Callbacks("once memory");
    ns.CssCollector = (function() {
      function CssCollector() {
        this.urls = [];
        this.styles = [];
      }

      CssCollector.prototype.addUrl = function(url) {
        if (!/^https?:\/\//i.test(url)) {
          throw new Error('Embedded urls should be absolute. ' + url);
        }
        if (!(__indexOf.call(this.urls, url) >= 0)) {
          return this.urls.push(url);
        }
      };

      CssCollector.prototype.addStyle = function(style) {
        return this.styles.push(style);
      };

      return CssCollector;

    })();
    uploadcare.tabsCss = new ns.CssCollector;
    return defaults['_emptyKeyText'] = "<div class=\"uploadcare-dialog-message-center\">\n<div class=\"uploadcare-dialog-big-title\">Hello!</div>\n<div class=\"uploadcare-dialog-large-text\">\n  <div>Your <a class=\"uploadcare-link\" href=\"https://uploadcare.com/dashboard/\">public key</a> is not set.</div>\n  <div>Add this to the &lt;head&gt; tag to start uploading files:</div>\n  <div class=\"uploadcare-pre\">&lt;script&gt;\nUPLOADCARE_PUBLIC_KEY = 'your_public_key';\n&lt;/script&gt;</div>\n</div>\n</div>";
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.en = {
      uploading: 'Uploading... Please wait.',
      loadingInfo: 'Loading info...',
      errors: {
        "default": 'Error',
        baddata: 'Incorrect value',
        size: 'File too big',
        upload: 'Can’t upload',
        user: 'Upload canceled',
        info: 'Can’t load info',
        image: 'Only images allowed',
        createGroup: 'Can’t create file group',
        deleted: 'File was deleted'
      },
      draghere: 'Drop a file here',
      file: {
        one: '%1 file',
        other: '%1 files'
      },
      buttons: {
        cancel: 'Cancel',
        remove: 'Remove',
        choose: {
          files: {
            one: 'Choose a file',
            other: 'Choose files'
          },
          images: {
            one: 'Choose an image',
            other: 'Choose images'
          }
        }
      },
      dialog: {
        done: 'Done',
        showFiles: 'Show files',
        tabs: {
          names: {
            'empty-pubkey': 'Welcome',
            preview: 'Preview',
            file: 'Local Files',
            url: 'Arbitrary Links',
            camera: 'Camera',
            facebook: 'Facebook',
            dropbox: 'Dropbox',
            gdrive: 'Google Drive',
            instagram: 'Instagram',
            vk: 'VK',
            evernote: 'Evernote',
            box: 'Box',
            skydrive: 'OneDrive',
            flickr: 'Flickr',
            huddle: 'Huddle'
          },
          file: {
            drag: 'Drop a file here',
            nodrop: 'Upload files from your computer',
            cloudsTip: 'Cloud storages<br>and social networks',
            or: 'or',
            button: 'Choose a local file',
            also: 'You can also choose it from'
          },
          url: {
            title: 'Files from the Web',
            line1: 'Grab any file off the web.',
            line2: 'Just provide the link.',
            input: 'Paste your link here...',
            button: 'Upload'
          },
          camera: {
            capture: 'Take a photo',
            mirror: 'Mirror',
            startRecord: 'Record a video',
            stopRecord: 'Stop',
            cancelRecord: 'Cancel',
            retry: 'Request permissions again',
            pleaseAllow: {
              title: 'Please allow access to your camera',
              text: 'You have been prompted to allow camera access from this site. ' + 'In order to take pictures with your camera you must approve this request.'
            },
            notFound: {
              title: 'No camera detected',
              text: 'Looks like you have no camera connected to this device.'
            }
          },
          preview: {
            unknownName: 'unknown',
            change: 'Cancel',
            back: 'Back',
            done: 'Add',
            unknown: {
              title: 'Uploading... Please wait for a preview.',
              done: 'Skip preview and accept'
            },
            regular: {
              title: 'Add this file?',
              line1: 'You are about to add the file above.',
              line2: 'Please confirm.'
            },
            image: {
              title: 'Add this image?',
              change: 'Cancel'
            },
            crop: {
              title: 'Crop and add this image',
              done: 'Done',
              free: 'free'
            },
            video: {
              title: 'Add this video?',
              change: 'Cancel'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Something went wrong during the upload.',
                back: 'Please try again'
              },
              image: {
                title: 'Only image files are accepted.',
                text: 'Please try again with another file.',
                back: 'Choose image'
              },
              size: {
                title: 'The file you selected exceeds the limit.',
                text: 'Please try again with another file.'
              },
              loadImage: {
                title: 'Error',
                text: 'Can’t load image'
              }
            },
            multiple: {
              title: 'You’ve chosen %files%',
              question: 'Do you want to add all of these files?',
              tooManyFiles: 'You’ve chosen too many files. %max% is maximum.',
              tooFewFiles: 'You’ve chosen %files%. At least %min% required.',
              clear: 'Remove all',
              done: 'Done'
            }
          }
        },
        footer: {
          text: 'powered by',
          link: 'uploadcare'
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.en = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  var $, s, utils;

  utils = uploadcare.utils, s = uploadcare.settings, $ = uploadcare.jQuery;

  uploadcare.namespace('locale', function(ns) {
    var build, defaultLang, defaults, translate, _build;
    defaultLang = 'en';
    defaults = {
      lang: defaultLang,
      translations: ns.translations[defaultLang],
      pluralize: ns.pluralize[defaultLang]
    };
    _build = function(settings) {
      var lang, pluralize, translations;
      lang = settings.locale || defaults.lang;
      translations = $.extend(true, {}, ns.translations[lang], settings.localeTranslations);
      pluralize = $.isFunction(settings.localePluralize) ? settings.localePluralize : ns.pluralize[lang];
      return {
        lang: lang,
        translations: translations,
        pluralize: pluralize
      };
    };
    build = utils.once(function() {
      return _build(s.build());
    });
    ns.rebuild = function(settings) {
      var result;
      result = _build(s.build(settings));
      return build = function() {
        return result;
      };
    };
    translate = function(key, node) {
      var path, subkey, _i, _len;
      path = key.split('.');
      for (_i = 0, _len = path.length; _i < _len; _i++) {
        subkey = path[_i];
        if (node == null) {
          return null;
        }
        node = node[subkey];
      }
      return node;
    };
    return ns.t = function(key, n) {
      var locale, value, _ref;
      locale = build();
      value = translate(key, locale.translations);
      if ((value == null) && locale.lang !== defaults.lang) {
        locale = defaults;
        value = translate(key, locale.translations);
      }
      if (n != null) {
        if (locale.pluralize != null) {
          value = ((_ref = value[locale.pluralize(n)]) != null ? _ref.replace('%1', n) : void 0) || n;
        } else {
          value = '';
        }
      }
      return value || '';
    };
  });

}).call(this);
(function() {
  var $, locale, utils;

  locale = uploadcare.locale, utils = uploadcare.utils, $ = uploadcare.jQuery;

  uploadcare.namespace('templates', function(ns) {
    ns.JST = {};
    return ns.tpl = function(key, ctx) {
      var fn;
      if (ctx == null) {
        ctx = {};
      }
      fn = ns.JST[key];
      if (fn != null) {
        return fn($.extend({
          t: locale.t,
          utils: utils,
          uploadcare: uploadcare
        }, ctx));
      } else {
        return '';
      }
    };
  });

}).call(this);
uploadcare.templates.JST["circle-text"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget-circle-back">\r\n  <div class="uploadcare-widget-circle-text"></div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["dialog"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog uploadcare-responsive-panel"><!--\r\n--><div class="uploadcare-dialog-inner-wrap">\r\n    <div class="uploadcare-dialog-close">×</div>\r\n    <div class="uploadcare-dialog-placeholder"></div>\r\n  </div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["panel"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-panel">\r\n  <div class="uploadcare-dialog-tabs"></div>\r\n\r\n  <div class="uploadcare-panel-footer uploadcare-panel-footer__summary">\r\n    <div class="uploadcare-dialog-button uploadcare-dialog-source-base-show-files"\r\n         tabindex="0" role="button">\r\n      ',(''+ t('dialog.showFiles') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n      <div class="uploadcare-panel-footer-counter"></div>\r\n    </div>\r\n    <div class="uploadcare-dialog-button-success uploadcare-dialog-source-base-done"\r\n         tabindex="0" role="button">',(''+ t('dialog.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n    <div class="uploadcare-panel-footer-text"></div>\r\n  </div>\r\n</div>\r\n<div class="uploadcare-dialog-footer">\r\n  ',(''+ t('dialog.footer.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  <svg width="13" height="13" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><title>Uploadcare Logo</title><g fill="none" fill-rule="evenodd"><path d="M-1-1h32v32H-1z"/><path d="M15 29.452c7.98 0 14.452-6.47 14.452-14.452C29.452 7.02 22.982.548 15 .548 7.02.548.548 7.018.548 15c0 7.98 6.47 14.452 14.452 14.452zm0-12.846c.887 0 1.606-.72 1.606-1.606 0-.887-.72-1.606-1.606-1.606-.887 0-1.606.72-1.606 1.606 0 .887.72 1.606 1.606 1.606z" fill="#FFD800"/></g></svg>\r\n  <a href="https://uploadcare.com/?utm_campaign=widget&utm_source=copyright&utm_medium=desktop&utm_content=',(''+ uploadcare.version ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\r\n     target="_blank">',(''+ t('dialog.footer.link') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</a>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["styles"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\n\n\n\n\n\n\n\n.uploadcare-dialog-disabled-tab:hover:before,.uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before{background-image:url("',  settings.scriptBase ,'/images/tab-icons.png");background-size:50px}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url("',  settings.scriptBase ,'/images/tab-icons-active.png");background-size:50px}.uploadcare-dialog-file-sources:before{background-image:url("',  settings.scriptBase ,'/images/arrow.png")}.uploadcare-remove{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAABM0lEQVQoz5VTvW7CMBC2kHivQsjrZGRjaB6lXWCJbWScIT8PYN0GQ7s6FUUKL8CA2suR2C4FlfqkyL77cuf7/B1jbp3GdmIW1VIVKq9ezMI+ncbs92omNeeQgYQ1msQdh5o30x+g82ibCAysr4yDgG1yHjngLhkyXVuXeZcMRSNJMI4mAwinGl2siaiFWncOAW/QgO4vwCGHD/QI2tca27LxEDrAF7QE5fg94ungfrMxM89ZXyqnYAsbtG53RM/lKhmYlJUr6XrUPbQlmHY8SChXTBUhHRsCXfKGdKmCKe2PApQDKmokAJavD5b2zei+hTvNDPQI+HR5PD3C0+MJf4c95vCE79ETEI5POPvzCWf/EwXJbH5XZvNAZqSh6U3hRjc0jqMQmxRHoVRltTSpjcNR+AZwwvykEau0BgAAAABJRU5ErkJggg==)}.uploadcare-file-item__error:before{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABIklEQVR42q3Vv2rCUBTHcaEQH825TdLl9hl0FsFdV7s5uXSpb+DoEziV6JCgATdR02D9E09/R64KF3NPbQx84BJOvgRyuSktK5VbHHiFDwhhCwl86Xu+nimZbsWeYQIkmMCLLfgELaA7tfSzRlCISVEz6AEV5J2DDszyBtNGg7L5/CSt123BGBwOKqA8WRzT+cqmU+kt3zj4aQ0myTW4WEjBPgcj29B+NLoE98OhFIw4+GMb2vR6l+Cm25WCWw6ubUPftRrR8XiSVKt/CgZADxKJH2XlurQbDBivxY8ibpu02SR98VrcNuLGXitFh/GYDkHAa2ljlznIfKCCfPNwaBeItfOOr84/Yu/m8WVy7zhgPfHE1hxQ0IcQdlqo76m8X8Avwkyxg4iIuCEAAAAASUVORK5CYII=)}.uploadcare-file-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAABD0lEQVQoFQXBPa5OARQF0LXPvfKS9wo/hegMQUzEJESiUIpOoxOlRKJDIgqVUZiNqPGdba0AAPLj48Mn/8ApgEcPOAGArx/uPVvrEFVRA04A+PTu+vk1BlSwLuAE4Pubvy+vHGAFxABOgC+v/ryO24oYUVUDGODzi+PtjfuuXBBUxG8XASd8e3rz/o5rY60YwVjXKAj8/HXrblDFIAKCehxOOHcxCggWUTHghJYqIqIigoqCEyCKEcXFgAjghCAWi1EDIlgwABWxoIhYaxUMsIo4BEHBRR1ggMMogoqq4jCAgVo1VhGMgFjACQUjCKIqIigYqKiLILiogFULBkbUWhSDqKpYMFAFwaJGUVUH+A8ToG9OM8KqQQAAAABJRU5ErkJggg==)}.uploadcare-zoomable-icon:after{background-image:url("',  settings.scriptBase ,'/images/zoom@2x.png")}.uploadcare-dialog-error-tab-illustration{background-image:url("',  settings.scriptBase ,'/images/error-default.png")}.uploadcare-dialog-camera-holder .uploadcare-dialog-error-tab-illustration,.uploadcare-dialog-error-tab-image .uploadcare-dialog-error-tab-illustration{background-image:url("',  settings.scriptBase ,'/images/error-image.png")}.uploadcare-dialog{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQIHWMw/AQAAVcBJCiBozgAAAAASUVORK5CYII=);background:rgba(48,48,48,.7)}@media (-webkit-min-device-pixel-ratio:1.5),(min-resolution:144dpi){.uploadcare-dialog-disabled-tab:hover:before,.uploadcare-dialog-tab:before,.uploadcare-dialog-tab:hover:before{background-image:url("',  settings.scriptBase ,'/images/tab-icons@2x.png")}.uploadcare-dialog-tab_current:before,.uploadcare-dialog-tab_current:hover:before{background-image:url("',  settings.scriptBase ,'/images/tab-icons-active@2x.png")}}html.uploadcare-dialog-opened{overflow:hidden}.uploadcare-dialog{font-family:"Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif;position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;overflow:auto;white-space:nowrap;text-align:center}.uploadcare-dialog:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog *{margin:0;padding:0}.uploadcare-dialog .uploadcare-dialog-panel{border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.35)}.uploadcare-dialog{-webkit-transition:opacity .33s cubic-bezier(.05,.7,.25,1);transition:opacity .33s cubic-bezier(.05,.7,.25,1);opacity:0}.uploadcare-dialog .uploadcare-dialog-inner-wrap{-webkit-transition:-webkit-transform .33s cubic-bezier(.05,.7,.25,1);transition:transform .33s cubic-bezier(.05,.7,.25,1);transition:transform .33s cubic-bezier(.05,.7,.25,1),-webkit-transform .33s cubic-bezier(.05,.7,.25,1);-webkit-transform:scale(.8);-ms-transform:scale(.8);transform:scale(.8);-webkit-transform-origin:50% 100%;-ms-transform-origin:50% 100%;transform-origin:50% 100%}.uploadcare-dialog.uploadcare-active{opacity:1}.uploadcare-dialog.uploadcare-active .uploadcare-dialog-inner-wrap{-webkit-transform:none;-ms-transform:none;transform:none}.uploadcare-dialog-inner-wrap{display:inline-block;vertical-align:middle;white-space:normal;text-align:left;box-sizing:border-box;position:relative;width:100%;min-width:760px;max-width:944px;padding:0 33px 0 11px}.uploadcare-dialog-close{width:33px;height:33px;line-height:33px;font-size:29.7px;font-weight:700;color:#fff;cursor:pointer;position:absolute;text-align:center;right:0}.uploadcare-dialog-panel{overflow:hidden;position:relative;background:#efefef;font-weight:400;padding-left:75px;box-sizing:border-box}.uploadcare-dialog-panel :focus{outline:2px dotted #0094c0}.uploadcare-dialog-panel .uploadcare-mouse-focused:focus,.uploadcare-dialog-panel :active{outline:none}.uploadcare-dialog-panel.uploadcare-panel-hide-tabs{padding-left:0}.uploadcare-dialog-tabs{box-sizing:border-box;width:75px;height:616px;margin-left:-75px;float:left;background:#dee0e1;border-right:1px solid #c5cace}.uploadcare-panel-hide-tabs .uploadcare-dialog-tabs{display:none}.uploadcare-dialog-tab{box-sizing:border-box;height:56px;position:relative;border-bottom:1px solid #c5cace;cursor:pointer}.uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-dialog-tab:before{box-sizing:border-box;position:absolute;top:50%;left:50%;display:inline-block;width:50px;height:50px;margin:-25px;opacity:.66}.uploadcare-dialog-tab:before{content:\'\'}.uploadcare-dialog-tab:hover{background-color:#e5e7e8}.uploadcare-dialog-tab:hover .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab:hover:before{opacity:1}.uploadcare-dialog-tab_current{margin-right:-1px;border-right:1px solid #efefef;background-color:#efefef}.uploadcare-dialog-tab_current:hover{background-color:#efefef}.uploadcare-dialog-tab_current .uploadcare-dialog-icon{opacity:1}.uploadcare-dialog-tab_current:before{opacity:1}.uploadcare-dialog-tab_hidden{display:none!important}.uploadcare-dialog-disabled-tab{cursor:default}.uploadcare-dialog-disabled-tab:hover{background-color:#dee0e1}.uploadcare-dialog-tab-preview .uploadcare-widget-circle{padding:10px}.uploadcare-dialog-tab-preview .uploadcare-widget-circle--canvas{color:#828689;border-color:#bfbfbf}.uploadcare-dialog-tab-preview.uploadcare-dialog-tab_current .uploadcare-widget-circle--canvas{color:#d0bf26;border-color:#e1e5e7}.uploadcare-dialog-tab-preview:before{display:none}.uploadcare-dialog-tab-file:before{background-position:0 -50px}.uploadcare-dialog-tab-url:before{background-position:0 -100px}.uploadcare-dialog-tab-facebook:before{background-position:0 -150px}.uploadcare-dialog-tab-dropbox:before{background-position:0 -200px}.uploadcare-dialog-tab-gdrive:before{background-position:0 -250px}.uploadcare-dialog-tab-instagram:before{background-position:0 -300px}.uploadcare-dialog-tab-vk:before{background-position:0 -350px}.uploadcare-dialog-tab-evernote:before{background-position:0 -400px}.uploadcare-dialog-tab-box:before{background-position:0 -450px}.uploadcare-dialog-tab-skydrive:before{background-position:0 -500px}.uploadcare-dialog-tab-flickr:before{background-position:0 -550px}.uploadcare-dialog-tab-camera:before{background-position:0 -600px}.uploadcare-dialog-tab-huddle:before{background-position:0 -650px}.uploadcare-dialog-tabs-panel{position:relative;display:none;box-sizing:border-box;height:616px;line-height:22px;font-size:16px;color:#000}.uploadcare-dialog-multiple .uploadcare-dialog-tabs-panel{height:550px}.uploadcare-dialog-tabs-panel .uploadcare-dialog-input{box-sizing:border-box;width:100%;height:44px;margin-bottom:22px;padding:11px 12.5px;font-family:inherit;font-size:16px;border:1px solid #c5cace;background:#fff;color:#000}.uploadcare-dialog-tabs-panel_current{display:block}.uploadcare-pre{white-space:pre;font-family:monospace;margin:22px auto;padding:22px 25px;background-color:#fff;border:1px solid #c5cace;border-radius:3px;text-align:left;font-size:15px;line-height:22px}.uploadcare-dialog-footer{font-size:13px;line-height:1.4em;text-align:center;color:#fff;margin:15px}.uploadcare-dialog .uploadcare-dialog-footer svg{vertical-align:middle;padding:0 2px}.uploadcare-dialog .uploadcare-dialog-footer a{color:#fff;text-decoration:none}.uploadcare-dialog .uploadcare-dialog-footer a:hover{text-decoration:underline}.uploadcare-dialog-title{font-size:22px;line-height:1;margin-bottom:22px}.uploadcare-dialog-title.uploadcare-error{color:red}.uploadcare-dialog-title2{font-size:20px;line-height:1;padding-bottom:11px}.uploadcare-dialog-big-title{font-size:40px;font-weight:700;line-height:1em;margin-bottom:50px}.uploadcare-dialog-label{font-size:15px;line-height:25px;margin-bottom:12.5px;word-wrap:break-word}.uploadcare-dialog-large-text{font-size:20px;font-weight:400;line-height:1.5em}.uploadcare-dialog-large-text .uploadcare-pre{display:inline-block;font-size:18px}.uploadcare-dialog-section{margin-bottom:22px}.uploadcare-dialog-normal-text{font-size:13px;color:#545454}.uploadcare-dialog-button,.uploadcare-dialog-button-success{display:inline-block;font-size:13px;line-height:30px;padding:0 12.5px;margin-right:.5em;border:solid 1px;border-radius:3px;cursor:pointer}.uploadcare-dialog-button{color:#444}.uploadcare-dialog-button,.uploadcare-dialog-button.uploadcare-disabled-el:active,.uploadcare-dialog-button.uploadcare-disabled-el:hover,.uploadcare-dialog-button[disabled]:active,.uploadcare-dialog-button[disabled]:hover{background:#f3f3f3;background:-webkit-linear-gradient(#f5f5f5,#f1f1f1);background:linear-gradient(#f5f5f5,#f1f1f1);box-shadow:none;border-color:#dcdcdc}.uploadcare-dialog-button:hover{background:#f9f9f9;background:-webkit-linear-gradient(#fbfbfb,#f6f6f6);background:linear-gradient(#fbfbfb,#f6f6f6);box-shadow:inset 0 -1px 3px rgba(0,0,0,.05)}.uploadcare-dialog-button:active{background:#f3f3f3;background:-webkit-linear-gradient(#f5f5f5,#f1f1f1);background:linear-gradient(#f5f5f5,#f1f1f1);box-shadow:inset 0 2px 2px rgba(0,0,0,.05)}.uploadcare-dialog-button.uploadcare-disabled-el,.uploadcare-dialog-button[disabled]{cursor:default;opacity:.6}.uploadcare-dialog-button:active,.uploadcare-dialog-button:hover{border-color:#cbcbcb}.uploadcare-dialog-button-success{color:#fff}.uploadcare-dialog-button-success,.uploadcare-dialog-button-success.uploadcare-disabled-el:active,.uploadcare-dialog-button-success.uploadcare-disabled-el:hover,.uploadcare-dialog-button-success[disabled]:active,.uploadcare-dialog-button-success[disabled]:hover{background:#3886eb;background:-webkit-linear-gradient(#3b8df7,#347fdf);background:linear-gradient(#3b8df7,#347fdf);box-shadow:none;border-color:#266fcb}.uploadcare-dialog-button-success:hover{background:#337ad6;background:-webkit-linear-gradient(#3986ea,#2c6dc2);background:linear-gradient(#3986ea,#2c6dc2)}.uploadcare-dialog-button-success:active{background:#3178d3;background:-webkit-linear-gradient(#3680e1,#2c6fc5);background:linear-gradient(#3680e1,#2c6fc5)}.uploadcare-dialog-button-success.uploadcare-disabled-el,.uploadcare-dialog-button-success[disabled]{cursor:default;opacity:.6}.uploadcare-dialog-button-success:active,.uploadcare-dialog-button-success:hover{border-color:#266eca #1f62b7 #1753a1}.uploadcare-dialog-button-success:hover{box-shadow:inset 0 -1px 3px rgba(22,82,160,.5)}.uploadcare-dialog-button-success:active{box-shadow:inset 0 1px 3px rgba(22,82,160,.4)}.uploadcare-dialog-big-button{border-radius:100px;font-size:20px;font-weight:400;letter-spacing:1px;color:#fff;line-height:33px;border:solid 1px #276fcb;text-shadow:0 -1px #2a7ce5;display:inline-block;padding:16.5px 2em;cursor:pointer;box-shadow:inset 0 -2px #1f66c1;background:#458eee;background:-webkit-linear-gradient(#4892f6,#4289e6);background:linear-gradient(#4892f6,#4289e6)}.uploadcare-dialog-big-button:hover{box-shadow:inset 0 -2px #1652a0;background:#337ad7;background:-webkit-linear-gradient(#3986eb,#2c6dc2);background:linear-gradient(#3986eb,#2c6dc2)}.uploadcare-dialog-big-button:active{box-shadow:inset 0 2px #2561b9;background:#2c6ec3;background:-webkit-linear-gradient(#2c6ec3,#2c6ec3);background:linear-gradient(#2c6ec3,#2c6ec3)}.uploadcare-dialog-preview-image-wrap,.uploadcare-dialog-preview-video-wrap{white-space:nowrap;text-align:center;width:100%;height:462px}.uploadcare-dialog-preview-image-wrap:before,.uploadcare-dialog-preview-video-wrap:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog-preview--with-sizes .uploadcare-dialog-preview-image-wrap,.uploadcare-dialog-preview--with-sizes .uploadcare-dialog-preview-video-wrap{position:relative;top:-40px;height:422px}.uploadcare-dialog-preview-image,.uploadcare-dialog-preview-video{display:inline-block;vertical-align:middle;white-space:normal;max-width:100%;max-height:100%}.uploadcare-dialog-tabs-panel-preview.uploadcare-dialog-tabs-panel_current~.uploadcare-panel-footer{display:none}.uploadcare-panel-footer{box-sizing:border-box;background:#fff3be;border-top:1px solid #efe2a9;height:66px;padding:17px 25px 0}.uploadcare-panel-footer .uploadcare-dialog-button-success{float:right}.uploadcare-panel-footer .uploadcare-dialog-button{float:left}.uploadcare-panel-footer .uploadcare-dialog-button,.uploadcare-panel-footer .uploadcare-dialog-button-success{min-width:100px;text-align:center;margin-right:0}.uploadcare-panel-footer .uploadcare-error{color:red}.uploadcare-panel-footer-text{text-align:center;color:#85732c;font-size:15px;line-height:32px}.uploadcare-dialog-message-center{text-align:center;padding-top:110px}.uploadcare-dialog-preview-center{text-align:center;padding-top:176px}.uploadcare-dialog-preview-circle{width:66px;height:66px;display:inline-block;margin-bottom:22px}.uploadcare-dialog-error-tab-wrap{height:100%;text-align:center;white-space:nowrap}.uploadcare-dialog-error-tab-wrap:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-title{margin-bottom:12px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-error-tab-wrap .uploadcare-dialog-button-success{margin:0}.uploadcare-dialog-error-tab-wrap2{display:inline-block;vertical-align:middle;white-space:normal;margin-top:-22px}.uploadcare-dialog-error-tab-illustration{display:inline-block;width:170px;height:120px;background-position:center;background-repeat:no-repeat;margin-bottom:38px}.uploadcare-draganddrop .uploadcare-if-no-draganddrop,.uploadcare-if-draganddrop{display:none}.uploadcare-draganddrop .uploadcare-if-draganddrop{display:block}.uploadcare-draganddrop .uploadcare-dialog-file-drop-area{border:dashed 3px #c5cacd;background:rgba(255,255,255,.64)}.uploadcare-draganddrop .uploadcare-dialog-file-title{color:#dee0e1;text-shadow:0 1px #fff;margin-top:0}.uploadcare-dialog-file-drop-area{width:100%;height:100%;box-sizing:border-box;border:none;text-align:center;border-radius:3px;padding-top:70px}.uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button{margin-top:11px;margin-bottom:55px}.uploadcare-dialog-file-title{font-size:40px;line-height:1;color:#000;font-weight:700;margin:66px 0}.uploadcare-dialog-file-or{font-size:13px;color:#8f9498;margin-bottom:33px}.uploadcare-dialog-file-sources{position:relative;display:inline-block;padding:0 80px 0 100px;line-height:2em}.uploadcare-dialog-file-sources:before{background-repeat:no-repeat;content:\'\';display:block;position:absolute;width:67px;height:44px;padding:0;top:-30px;left:10px}.uploadcare-dialog-file-source{display:inline;font-size:15px;margin-right:.2em;cursor:pointer;font-weight:300;white-space:nowrap}.uploadcare-dialog-file-source:after{content:\'\\00B7\';color:#b7babc;margin-left:.5em}.uploadcare-dialog-file-source:last-child:after{display:none}.uploadcare-dragging .uploadcare-dialog-file-drop-area .uploadcare-dialog-big-button,.uploadcare-dragging .uploadcare-dialog-file-or,.uploadcare-dragging .uploadcare-dialog-file-sources{display:none}.uploadcare-dragging .uploadcare-dialog-file-drop-area{background-color:#f0f0f0;border-color:#b3b5b6;padding-top:264px}.uploadcare-dragging .uploadcare-dialog-file-title{color:#707478}.uploadcare-dragging.uploadcare-dialog-file-drop-area{background-color:#f2f7fe;border-color:#438ae7}.uploadcare-dragging.uploadcare-dialog-file-drop-area .uploadcare-dialog-file-title{color:#438ae7}.uploadcare-dialog-camera-holder{white-space:nowrap;text-align:center;height:528px}.uploadcare-dialog-camera-holder:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-dialog-camera-holder .uploadcare-dialog-normal-text{margin-bottom:38px}.uploadcare-dialog-multiple .uploadcare-dialog-camera-holder{height:462px}.uploadcare-dialog-camera-video{vertical-align:middle;white-space:normal;display:none;max-width:100%;max-height:528px;-webkit-transition:-webkit-transform .8s cubic-bezier(.23,1,.32,1);transition:transform .8s cubic-bezier(.23,1,.32,1);transition:transform .8s cubic-bezier(.23,1,.32,1),-webkit-transform .8s cubic-bezier(.23,1,.32,1)}.uploadcare-dialog-multiple .uploadcare-dialog-camera-video{max-height:462px}.uploadcare-dialog-camera--mirrored{-webkit-transform:scale(-1,1);-ms-transform:scale(-1,1);transform:scale(-1,1)}.uploadcare-dialog-camera-message{vertical-align:middle;white-space:normal;display:none;max-width:450px}.uploadcare-dialog-camera-controls{margin-top:17px;text-align:center}.uploadcare-dialog-camera-mirror{position:absolute;margin-right:0;right:25px}.uploadcare-dialog-camera-cancel-record,.uploadcare-dialog-camera-capture,.uploadcare-dialog-camera-mirror,.uploadcare-dialog-camera-not-found,.uploadcare-dialog-camera-retry,.uploadcare-dialog-camera-start-record,.uploadcare-dialog-camera-stop-record{display:none}.uploadcare-dialog-camera-requested .uploadcare-dialog-camera-message{display:inline-block}.uploadcare-dialog-camera-not-founded .uploadcare-dialog-camera-please-allow{display:none}.uploadcare-dialog-camera-not-founded .uploadcare-dialog-camera-not-found{display:block}.uploadcare-dialog-camera-denied .uploadcare-dialog-camera-message,.uploadcare-dialog-camera-denied .uploadcare-dialog-camera-retry,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-capture,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-mirror,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-start-record,.uploadcare-dialog-camera-ready .uploadcare-dialog-camera-video,.uploadcare-dialog-camera-recording .uploadcare-dialog-camera-cancel-record,.uploadcare-dialog-camera-recording .uploadcare-dialog-camera-stop-record,.uploadcare-dialog-camera-recording .uploadcare-dialog-camera-video{display:inline-block}.uploadcare-file-list{height:550px;overflow:auto;position:relative;margin:0 -25px -22px 0}.uploadcare-dialog-multiple .uploadcare-file-list{height:484px}.uploadcare-file-list_table .uploadcare-file-item{border-top:1px solid #e3e3e3;border-bottom:1px solid #e3e3e3;margin-bottom:-1px;display:table;table-layout:fixed;width:100%;padding:10px 0;min-height:20px}.uploadcare-file-list_table .uploadcare-file-item>*{box-sizing:content-box;display:table-cell;vertical-align:middle;padding-right:20px}.uploadcare-file-list_table .uploadcare-file-item:last-child{margin-bottom:0}.uploadcare-file-list_table .uploadcare-file-item:hover{background:#ececec}.uploadcare-file-list_table .uploadcare-file-item__preview{width:55px;padding-right:10px}.uploadcare-file-list_table .uploadcare-file-item__preview>img{height:55px}.uploadcare-file-list_table .uploadcare-file-item__size{width:3.5em}.uploadcare-file-list_table .uploadcare-file-item__progressbar{width:80px}.uploadcare-file-list_table .uploadcare-zoomable-icon:after{width:55px}.uploadcare-file-list_tiles .uploadcare-file-item{text-align:left;position:relative;display:inline-block;vertical-align:top;width:170px;min-height:170px;padding:0 20px 10px 0}.uploadcare-file-list_tiles .uploadcare-file-item>*{padding-bottom:10px}.uploadcare-file-list_tiles .uploadcare-file-item__name{padding-top:10px}.uploadcare-file-list_tiles .uploadcare-file-item__remove{position:absolute;top:0;right:10px}.uploadcare-file-list_tiles .uploadcare-file-item__preview{white-space:nowrap;width:170px;height:170px;padding-bottom:0}.uploadcare-file-list_tiles .uploadcare-file-item__preview:before{display:inline-block;vertical-align:middle;content:\'\';height:100%;position:static;width:0}.uploadcare-file-list_tiles .uploadcare-file-item__preview img{display:inline-block;vertical-align:middle;white-space:normal}.uploadcare-file-list_tiles .uploadcare-file-item_error .uploadcare-file-item__preview,.uploadcare-file-list_tiles .uploadcare-file-item_uploaded .uploadcare-file-item__name,.uploadcare-file-list_tiles .uploadcare-file-item_uploaded .uploadcare-file-item__size,.uploadcare-file-list_tiles .uploadcare-file-item_uploading .uploadcare-file-item__preview{display:none}.uploadcare-file-icon,.uploadcare-file-item__error:before{content:\'\';display:inline-block;width:20px;height:20px;margin:-3.5px .7em -3.5px 0}.uploadcare-file-item{font-size:13px;line-height:1.2}.uploadcare-file-item:hover .uploadcare-file-item__remove{visibility:visible}.uploadcare-file-item:hover .uploadcare-zoomable-icon:after{display:block}.uploadcare-file-item_error .uploadcare-file-item__progressbar,.uploadcare-file-item_error .uploadcare-file-item__size,.uploadcare-file-item_uploaded .uploadcare-file-item__error,.uploadcare-file-item_uploaded .uploadcare-file-item__progressbar,.uploadcare-file-item_uploading .uploadcare-file-item__error{display:none}.uploadcare-file-item__preview{text-align:center;line-height:0}.uploadcare-file-item__preview>img{display:inline-block;width:auto;height:auto;max-width:100%;max-height:100%}.uploadcare-file-item__name{width:100%;word-wrap:break-word}.uploadcare-file-item__error{width:200px;color:#f5444b}.uploadcare-file-item__remove{visibility:hidden;width:20px;text-align:right;line-height:0}.uploadcare-remove{width:20px;height:20px;cursor:pointer}.uploadcare-zoomable-icon{position:relative;cursor:pointer}.uploadcare-zoomable-icon:after{content:\'\';position:absolute;top:0;left:0;display:none;width:100%;height:100%;background-size:45px 45px;background-repeat:no-repeat;background-position:center}.uploadcare-progressbar{width:100%;height:8px;background:#e0e0e0;border-radius:100px}.uploadcare-progressbar__value{height:100%;background:#d6b849;border-radius:100px}.uploadcare-file-icon{margin:0}.uploadcare-dialog-padding{padding:22px 25px}.uploadcare-dialog-remote-iframe-wrap{overflow:auto;-webkit-overflow-scrolling:touch}.uploadcare-dialog-remote-iframe{display:block;width:100%;height:100%;border:0;opacity:0}.uploadcare-hidden,.uploadcare-if-mobile,.uploadcare-panel-footer-counter,.uploadcare-panel-footer__summary{display:none}.uploadcare-dialog-multiple .uploadcare-panel-footer__summary{display:block}@media screen and (max-width:760px){.uploadcare-dialog-opened{overflow:visible!important;position:static!important;width:auto!important;height:auto!important;min-width:0!important;background:#efefef!important}body.uploadcare-dialog-opened>.uploadcare-inactive,body.uploadcare-dialog-opened>:not(.uploadcare-dialog){display:none!important}.uploadcare-if-mobile{display:block}.uploadcare-if-no-mobile{display:none}.uploadcare-dialog{position:absolute;overflow:visible;-webkit-text-size-adjust:100%}.uploadcare-dialog:before{display:none}.uploadcare-dialog-inner-wrap{padding:0;min-width:310px;height:100%}.uploadcare-dialog-close{position:fixed;z-index:2;color:#000;width:50px;height:50px;line-height:45px}.uploadcare-dialog-footer{display:none}.uploadcare-responsive-panel .uploadcare-dialog-panel{overflow:visible;height:100%;padding:50px 0 0;border-radius:0;box-shadow:none}.uploadcare-responsive-panel .uploadcare-dialog-panel.uploadcare-panel-hide-tabs{padding-top:0}.uploadcare-responsive-panel .uploadcare-dialog-tabs-panel{height:auto}.uploadcare-responsive-panel .uploadcare-dialog-remote-iframe-wrap{overflow:visible;height:100%}.uploadcare-responsive-panel .uploadcare-dialog-padding{padding:22px 15px}.uploadcare-responsive-panel .uploadcare-dialog-preview-image-wrap,.uploadcare-responsive-panel .uploadcare-dialog-preview-video-wrap{top:auto;height:auto;padding-bottom:50px}.uploadcare-responsive-panel .uploadcare-dialog-preview-image,.uploadcare-responsive-panel .uploadcare-dialog-preview-video{max-height:450px}.uploadcare-responsive-panel .uploadcare-file-list{height:auto;margin:0 -15px 0 0}.uploadcare-responsive-panel .uploadcare-file-list_table .uploadcare-file-item>*{padding-right:10px}.uploadcare-responsive-panel .uploadcare-file-list_table .uploadcare-file-item__progressbar{width:40px}.uploadcare-responsive-panel .uploadcare-file-list_tiles .uploadcare-file-item{width:140px;min-height:140px;padding-right:10px}.uploadcare-responsive-panel .uploadcare-file-list_tiles .uploadcare-file-item__preview{width:140px;height:140px}.uploadcare-responsive-panel .uploadcare-file-list_tiles .uploadcare-file-item__remove{right:10px}.uploadcare-responsive-panel .uploadcare-file-item__remove{visibility:visible}.uploadcare-responsive-panel .uploadcare-dialog-file-or,.uploadcare-responsive-panel .uploadcare-dialog-file-sources,.uploadcare-responsive-panel .uploadcare-dialog-file-title{display:none}.uploadcare-responsive-panel .uploadcare-dialog-file-drop-area{padding-top:0;border:0;background:0 0}.uploadcare-responsive-panel .uploadcare-dialog-big-button{margin:110px 0 0}.uploadcare-responsive-panel .uploadcare-clouds-tip{color:#909498;font-size:.75em;line-height:1.4;text-align:left;padding:10px 0 0 50px}.uploadcare-responsive-panel .uploadcare-clouds-tip:before{background-image:url("',  settings.scriptBase ,'/images/arrow.png");background-repeat:no-repeat;background-size:51px 33px;content:\'\';position:absolute;margin:-20px -36px;display:block;width:28px;height:30px}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab.uploadcare-dialog-tab-camera{display:none}.uploadcare-responsive-panel .uploadcare-dialog-camera-holder{height:auto}.uploadcare-responsive-panel .uploadcare-dialog-camera-mirror{right:15px}.uploadcare-responsive-panel .uploadcare-panel-footer{position:fixed;left:0;bottom:0;width:100%;min-width:310px;height:50px;padding:9px 15px 0;background:rgba(255,243,190,.95)}.uploadcare-responsive-panel .uploadcare-panel-footer-text{display:none}.uploadcare-responsive-panel .uploadcare-panel-footer-counter{display:inline}.uploadcare-responsive-panel .uploadcare-dialog-multiple.uploadcare-dialog-panel{padding-bottom:50px}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-remote-iframe-wrap:after{content:\'\';display:block;height:50px}.uploadcare-responsive-panel .uploadcare-dialog-multiple .uploadcare-dialog-padding{padding-bottom:72px}.uploadcare-responsive-panel .uploadcare-dialog-tabs{position:fixed;top:0;left:0;width:100%;min-width:310px;height:auto;float:none;margin:0;z-index:1;background:0 0}.uploadcare-responsive-panel .uploadcare-dialog-tab{display:none;height:50px;white-space:nowrap;background:#dee0e1}.uploadcare-responsive-panel .uploadcare-dialog-tab .uploadcare-dialog-icon,.uploadcare-responsive-panel .uploadcare-dialog-tab:before{position:static;margin:0 6px;vertical-align:middle;opacity:1}.uploadcare-responsive-panel .uploadcare-dialog-tab_current{display:block;background:rgba(239,239,239,.95)}.uploadcare-responsive-panel .uploadcare-dialog-tab:after{content:attr(title);font-size:20px;vertical-align:middle}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs-panel_current,.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-panel-footer{display:none}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tabs{position:absolute;z-index:3}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab{display:block}.uploadcare-responsive-panel .uploadcare-dialog-opened-tabs .uploadcare-dialog-tab_current{background:#efefef}.uploadcare-responsive-panel .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current{text-align:center}.uploadcare-responsive-panel .uploadcare-dialog-panel:not(.uploadcare-dialog-opened-tabs) .uploadcare-dialog-tab_current:after{content:\'\';position:absolute;top:16px;left:14px;display:block;width:22px;height:18px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAOCAQAAAD+6Ta3AAAARklEQVR4Ae3SsRFEIQhAwW1IR2s3s6zTGUN+AxdK5tucAIBmOuKSY2pQbHHZVhgiweAnEixW1uC0VdSU41Xo19+te73+9AGOg1FzTMH13gAAAABJRU5ErkJggg==);background-size:22px}.uploadcare-responsive-panel .uploadcare-crop-sizes{top:auto;margin-bottom:15px}.uploadcare-responsive-panel .uploadcare-crop-size{margin:0 10px}}.uploadcare-crop-widget.jcrop-holder{direction:ltr;text-align:left;z-index:0}.uploadcare-crop-widget .jcrop-hline,.uploadcare-crop-widget .jcrop-vline{z-index:320}.uploadcare-crop-widget .jcrop-handle,.uploadcare-crop-widget .jcrop-hline,.uploadcare-crop-widget .jcrop-vline{position:absolute;font-size:0;background-color:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.2)}.uploadcare-crop-widget .jcrop-vline{height:100%;width:1px!important}.uploadcare-crop-widget .jcrop-hline{height:1px!important;width:100%}.uploadcare-crop-widget .jcrop-vline.right{right:0}.uploadcare-crop-widget .jcrop-hline.bottom{bottom:0}.uploadcare-crop-widget .jcrop-tracker{height:100%;width:100%;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.uploadcare-crop-widget .jcrop-handle{border-radius:50%;width:13px;height:13px;z-index:330}.uploadcare-crop-widget .jcrop-handle:after,.uploadcare-crop-widget .jcrop-handle:before{content:"";position:absolute;display:block;width:1px;height:1px;background:#fff}.uploadcare-crop-widget .jcrop-handle:before{width:3px;top:6px}.uploadcare-crop-widget .jcrop-handle:after{height:3px;left:6px}.uploadcare-crop-widget .jcrop-handle.ord-nw:before,.uploadcare-crop-widget .jcrop-handle.ord-sw:before{left:12px}.uploadcare-crop-widget .jcrop-handle.ord-ne:before,.uploadcare-crop-widget .jcrop-handle.ord-se:before{left:-2px}.uploadcare-crop-widget .jcrop-handle.ord-ne:after,.uploadcare-crop-widget .jcrop-handle.ord-nw:after{top:12px}.uploadcare-crop-widget .jcrop-handle.ord-se:after,.uploadcare-crop-widget .jcrop-handle.ord-sw:after{top:-2px}.uploadcare-crop-widget .jcrop-handle.ord-nw{left:0;margin-left:-6px;margin-top:-6px;top:0}.uploadcare-crop-widget .jcrop-handle.ord-ne{margin-right:-6px;margin-top:-6px;right:0;top:0}.uploadcare-crop-widget .jcrop-handle.ord-se{bottom:0;margin-bottom:-6px;margin-right:-6px;right:0}.uploadcare-crop-widget .jcrop-handle.ord-sw{bottom:0;left:0;margin-bottom:-6px;margin-left:-6px}.uploadcare-crop-widget img.jcrop-preview,.uploadcare-crop-widget.jcrop-holder img{max-width:none}.uploadcare-crop-widget{display:inline-block;vertical-align:middle;white-space:normal}.uploadcare-crop-widget .jcrop-handle>div{width:35px;height:35px;margin:-11px}.uploadcare-crop-widget>div:first-child{-webkit-transform:translateZ(0);transform:translateZ(0)}.uploadcare-crop-widget>img{-webkit-filter:grayscale(50%);filter:grayscale(50%)}.uploadcare-crop-sizes{display:none;visibility:hidden;position:relative;top:433px;text-align:center}.uploadcare-dialog-preview--with-sizes .uploadcare-crop-sizes{display:block}.uploadcare-dialog-preview--loaded .uploadcare-crop-sizes{visibility:visible}.uploadcare-crop-size{position:relative;display:inline-block;width:40px;height:40px;line-height:40px;margin:0 20px;font-size:.55em;cursor:pointer;color:#444}.uploadcare-crop-size div{box-sizing:border-box;width:40px;height:30px;display:inline-block;vertical-align:middle;border:1px solid #ccc}.uploadcare-crop-size:after{content:attr(data-caption);position:absolute;top:1px;left:0;width:100%;text-align:center;margin:0}.uploadcare-crop-size--current div{background:#fff}.uploadcare-widget{position:relative;display:inline-block;vertical-align:baseline;line-height:2}.uploadcare-widget :focus{outline:2px dotted #0094c0}.uploadcare-widget .uploadcare-mouse-focused:focus,.uploadcare-widget :active{outline:none}.uploadcare-widget-status-error .uploadcare-widget-button-open,.uploadcare-widget-status-error .uploadcare-widget-text,.uploadcare-widget-status-loaded .uploadcare-widget-text,.uploadcare-widget-status-ready .uploadcare-widget-button-open,.uploadcare-widget-status-started .uploadcare-widget-button-cancel,.uploadcare-widget-status-started .uploadcare-widget-status,.uploadcare-widget-status-started .uploadcare-widget-text{display:inline-block!important}.uploadcare-widget-option-clearable.uploadcare-widget-status-error .uploadcare-widget-button-open{display:none!important}.uploadcare-widget-option-clearable.uploadcare-widget-status-error .uploadcare-widget-button-remove,.uploadcare-widget-option-clearable.uploadcare-widget-status-loaded .uploadcare-widget-button-remove{display:inline-block!important}.uploadcare-widget-status{display:none!important;width:1.8em;height:1.8em;margin:-1em 1ex -1em 0;line-height:0;vertical-align:middle}.uploadcare-widget-circle--text .uploadcare-widget-circle-back{width:100%;height:100%;display:table;white-space:normal}.uploadcare-widget-circle--text .uploadcare-widget-circle-text{display:table-cell;vertical-align:middle;text-align:center;font-size:60%;line-height:1}.uploadcare-widget-circle--canvas{color:#d0bf26;border-color:#e1e5e7}.uploadcare-widget-circle--canvas canvas{width:100%;height:100%}.uploadcare-widget-text{display:none!important;margin-right:1ex;white-space:nowrap}.uploadcare-widget-file-name,.uploadcare-widget-file-size{display:inline}.uploadcare-link,.uploadcare-link:link,.uploadcare-link:visited{cursor:pointer;color:#1a85ad;text-decoration:none;border-bottom:1px dotted #1a85ad;border-color:initial}.uploadcare-link:hover{color:#176e8f}.uploadcare-widget-button{display:none!important;color:#fff;padding:.4em .6em;line-height:1;margin:-1em .5ex -1em 0;border-radius:.25em;background:#c3c3c3;cursor:default;white-space:nowrap}.uploadcare-widget-button:hover{background:#b3b3b3}.uploadcare-widget-button-open{padding:.5em .8em;background:#18a5d0}.uploadcare-widget-button-open:hover{background:#0094c0}.uploadcare-widget-dragndrop-area{box-sizing:content-box;display:none;position:absolute;white-space:nowrap;top:50%;margin-top:-1.3em;left:-1em;padding:0 1em;line-height:2.6;min-width:100%;text-align:center;background-color:#f0f0f0;color:#707478;border:1px dashed #b3b5b6;border-radius:100px}.uploadcare-widget.uploadcare-dragging .uploadcare-widget-dragndrop-area{background-color:#f2f7fe;border-color:#438ae7;color:#438ae7}.uploadcare-dragging .uploadcare-widget-dragndrop-area{display:block}.uploadcare-dialog-opened .uploadcare-widget-dragndrop-area{display:none}\r\n');}return __p.join('');};uploadcare.templates.JST["tab-camera"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-camera-holder"><!--\r\n  --><video class="uploadcare-dialog-camera-video uploadcare-dialog-camera--mirrored"></video><!--\r\n  --><div class="uploadcare-dialog-camera-message">\r\n    <div class="uploadcare-dialog-error-tab-illustration"></div>\r\n\r\n    <div class="uploadcare-dialog-title uploadcare-dialog-camera-please-allow">\r\n      ',(''+ t('dialog.tabs.camera.pleaseAllow.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n    </div>\r\n    <div class="uploadcare-dialog-normal-text uploadcare-dialog-camera-please-allow">\r\n      ',(''+ t('dialog.tabs.camera.pleaseAllow.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n    </div>\r\n\r\n    <div class="uploadcare-dialog-title uploadcare-dialog-camera-not-found">\r\n      ',(''+ t('dialog.tabs.camera.notFound.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n    </div>\r\n    <div class="uploadcare-dialog-normal-text uploadcare-dialog-camera-not-found">\r\n      ',(''+ t('dialog.tabs.camera.notFound.text') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n    </div>\r\n\r\n    <div class="uploadcare-dialog-camera-retry uploadcare-dialog-button"\r\n         tabindex="0" role="button">\r\n      ',(''+ t('dialog.tabs.camera.retry') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n    </div>\r\n  </div><!--\r\n--></div>\r\n<div class="uploadcare-dialog-camera-controls">\r\n  <div class="uploadcare-dialog-camera-mirror uploadcare-dialog-button"\r\n       tabindex="0" role="button">\r\n    ',(''+ t('dialog.tabs.camera.mirror') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-capture uploadcare-dialog-button-success"\r\n       tabindex="0" role="button">\r\n    ',(''+ t('dialog.tabs.camera.capture') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-start-record uploadcare-dialog-button-success"\r\n       tabindex="0" role="button">\r\n    ',(''+ t('dialog.tabs.camera.startRecord') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-cancel-record uploadcare-dialog-button"\r\n       tabindex="0" role="button">\r\n    ',(''+ t('dialog.tabs.camera.cancelRecord') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-camera-stop-record uploadcare-dialog-button-success"\r\n       tabindex="0" role="button">\r\n    ',(''+ t('dialog.tabs.camera.stopRecord') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-file"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-file-drop-area">\r\n  <div class="uploadcare-dialog-file-title uploadcare-if-draganddrop">\r\n    ',(''+ t('dialog.tabs.file.drag') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-title uploadcare-if-no-draganddrop">\r\n    ',(''+ t('dialog.tabs.file.nodrop') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-or uploadcare-if-draganddrop">\r\n    ',(''+ t('dialog.tabs.file.or') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-clouds-tip uploadcare-if-mobile">\r\n    ',  t('dialog.tabs.file.cloudsTip') ,'\r\n  </div>\r\n  <div class="uploadcare-dialog-big-button needsclick">\r\n    ',(''+ t('dialog.tabs.file.button') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-or uploadcare-dialog-file-source-or">\r\n    ',(''+ t('dialog.tabs.file.also') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-dialog-file-sources">\r\n  </div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-error"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-error-tab-wrap uloadcare-dialog-error-tab-',(''+ error ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"><!--\r\n  --><div class="uploadcare-dialog-error-tab-wrap2">\r\n\r\n    <div class="uploadcare-dialog-error-tab-illustration"></div>\r\n\r\n    <div class="uploadcare-dialog-title">',(''+
        t('dialog.tabs.preview.error.'+error+'.title') || t('dialog.tabs.preview.error.default.title')
      ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n\r\n    <div class="uploadcare-dialog-normal-text">',(''+ 
        t('dialog.tabs.preview.error.'+error+'.text') || t('dialog.tabs.preview.error.default.text') 
      ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n\r\n    <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-back"\r\n         tabindex="0" role="button"\r\n            >',(''+ t('dialog.tabs.preview.error.'+error+'.back') || t('dialog.tabs.preview.error.default.back') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  </div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-image"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding uploadcare-dialog-preview-root">\r\n  <div class="uploadcare-dialog-title uploadcare-dialog-preview-title">\r\n    ',(''+ t('dialog.tabs.preview.image.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n\r\n  <div class="uploadcare-crop-sizes uploadcare-dialog-preview-crop-sizes">\r\n    <div class="uploadcare-crop-size" data-caption="free"><div></div></div>\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-preview-image-wrap"><!--\r\n      1162x684 is 1.5 size of conteiner\r\n    --><img\r\n      ');  if (file) { ; __p.push('\r\n        src="',(''+ file.originalUrl ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'-/preview/1162x693/-/setfill/efefef/-/format/jpeg/-/progressive/yes/"\r\n        title="',(''+ (file.name || "") ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\r\n        alt="',(''+ (file.name || "") ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'"\r\n      ');  } else { ; __p.push('\r\n        src="//:0"\r\n      ');  } ; __p.push('\r\n      class="uploadcare-dialog-preview-image"\r\n    />\r\n  </div>\r\n</div>\r\n\r\n<div class="uploadcare-panel-footer">\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.image.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-multiple-file"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-file-item uploadcare-file-item_uploading">\r\n  <div class="uploadcare-file-item__preview">\r\n    <div class="uploadcare-file-icon"></div>\r\n  </div>\r\n  <div class="uploadcare-file-item__name">\r\n    ',(''+ t('dialog.tabs.preview.unknownName') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n  <div class="uploadcare-file-item__progressbar">\r\n    <div class="uploadcare-progressbar">\r\n      <div class="uploadcare-progressbar__value"></div>\r\n    </div>\r\n  </div>\r\n  <div class="uploadcare-file-item__size"></div>\r\n  <div class="uploadcare-file-item__error"></div>\r\n  <div class="uploadcare-file-item__remove">\r\n    <div class="uploadcare-remove"></div>\r\n  </div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-multiple"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding">\r\n  <div class="uploadcare-dialog-title uploadcare-if-no-mobile uploadcare-dpm-title"></div>\r\n  <div class="uploadcare-dialog-title uploadcare-if-mobile uploadcare-dpm-mobile-title"></div>\r\n\r\n  <div class="uploadcare-file-list"></div>\r\n</div>\r\n\r\n<div class="uploadcare-panel-footer">\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.multiple.clear') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.multiple.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  <div class="uploadcare-panel-footer-text uploadcare-dpm-footer-text"></div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-regular"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding">\r\n  <div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.preview.regular.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n\r\n  <div class="uploadcare-dialog-label">\r\n    ',(''+ (file.name || t('dialog.tabs.preview.unknownName')) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'',(''+
        utils.readableFileSize(file.size, '', ', ') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\r\n    ',(''+ t('dialog.tabs.preview.regular.line1') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'<br/>\r\n    ',(''+ t('dialog.tabs.preview.regular.line2') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-unknown"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding">\r\n\r\n  <div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.preview.unknown.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n\r\n  <div class="uploadcare-dialog-label uploadcare-dialog-preview-label"></div>\r\n\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.unknown.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-preview-video"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-padding uploadcare-dialog-preview-root">\r\n  <div class="uploadcare-dialog-title uploadcare-dialog-preview-title">\r\n    ',(''+ t('dialog.tabs.preview.video.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div>\r\n\r\n  <div class="uploadcare-crop-sizes uploadcare-dialog-preview-crop-sizes">\r\n    <div class="uploadcare-crop-size" data-caption="free"><div></div></div>\r\n  </div>\r\n\r\n  <div class="uploadcare-dialog-preview-video-wrap">\r\n    <video controls class="uploadcare-dialog-preview-video"></video>\r\n  </div>\r\n</div>\r\n\r\n<div class="uploadcare-panel-footer">\r\n  <div class="uploadcare-dialog-button uploadcare-dialog-preview-back"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.video.change') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  <div class="uploadcare-dialog-button-success uploadcare-dialog-preview-done"\r\n       tabindex="0" role="button"\r\n          >',(''+ t('dialog.tabs.preview.done') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["tab-url"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-dialog-title">',(''+ t('dialog.tabs.url.title') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n<div class="uploadcare-dialog-section uploadcare-dialog-normal-text">\r\n  <div>',(''+ t('dialog.tabs.url.line1') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n  <div>',(''+ t('dialog.tabs.url.line2') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n</div>\r\n<form class="uploadcare-dialog-url-form">\r\n  <input type="text" class="uploadcare-dialog-input" placeholder="',(''+ t('dialog.tabs.url.input') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'">\r\n  <button class="uploadcare-dialog-button uploadcare-dialog-url-submit" type="submit">',(''+ t('dialog.tabs.url.button') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</button>\r\n</form>\r\n');}return __p.join('');};uploadcare.templates.JST["widget-button"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div tabindex="0" role="button"\r\n     class="uploadcare-widget-button uploadcare-widget-button-',  name ,'"\r\n>',(''+ caption ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div>\r\n');}return __p.join('');};uploadcare.templates.JST["widget-file-name"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget-file-name uploadcare-link"\r\n     tabindex="0" role="link">',(''+ utils.fitText(name, 20) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'</div><!--\r\n--><div class="uploadcare-widget-file-size">,\r\n    ',(''+ utils.readableFileSize(size) ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n</div>\r\n');}return __p.join('');};uploadcare.templates.JST["widget"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="uploadcare-widget">\r\n  <div class="uploadcare-widget-dragndrop-area">\r\n    ',(''+ t('draghere') ).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;'),'\r\n  </div><div class="uploadcare-widget-status">\r\n  </div><div class="uploadcare-widget-text">\r\n</div></div>\r\n');}return __p.join('');};(function() {
  var $, tpl;

  $ = uploadcare.jQuery;

  tpl = uploadcare.templates.tpl;

  uploadcare.settings.waitForSettings.add(function(settings) {
    var css, style;
    css = tpl('styles', {
      settings: settings
    });
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    if (style.styleSheet != null) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    return $('head').prepend(style);
  });

}).call(this);
/**
 * jquery.Jcrop.js v0.9.10
 * jQuery Image Cropping Plugin - released under MIT License 
 * Author: Kelly Hallman <khallman@gmail.com>
 * http://github.com/tapmodo/Jcrop
 * Copyright (c) 2008-2012 Tapmodo Interactive LLC {{{
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * }}}
 */


(function ($) {

  $.Jcrop = function (obj, opt) {
    var options = $.extend({}, $.Jcrop.defaults),
        docOffset, lastcurs;

    // Internal Methods {{{
    function px(n) {
      return Math.round(n) + 'px';
    }
    function cssClass(cl) {
      return options.baseClass + '-' + cl;
    }
    function supportsColorFade() {
      return $.fx.step.hasOwnProperty('backgroundColor');
    }
    function getPos(obj) //{{{
    {
      var pos = $(obj).offset();
      return [pos.left, pos.top];
    }
    //}}}
    function mouseAbs(e) //{{{
    {
      return [(e.pageX - docOffset[0]), (e.pageY - docOffset[1])];
    }
    //}}}
    function setOptions(opt) //{{{
    {
      if (typeof(opt) !== 'object') opt = {};
      options = $.extend(options, opt);

      $.each(['onChange','onSelect','onRelease','onDblClick'],function(i,e) {
        if (typeof(options[e]) !== 'function') options[e] = function () {};
      });
    }
    //}}}
    function startDragMode(mode, pos) //{{{
    {
      docOffset = getPos($img);

      if (mode === 'move') {
        return Tracker.activateHandlers(createMover(pos), doneSelect);
      }

      var fc = Coords.getFixed();
      var opp = oppLockCorner(mode);
      var opc = Coords.getCorner(oppLockCorner(opp));

      Coords.setPressed(Coords.getCorner(opp));
      Coords.setCurrent(opc);

      Tracker.activateHandlers(dragmodeHandler(mode, fc), doneSelect);
    }
    //}}}
    function dragmodeHandler(mode, f) //{{{
    {
      return function (pos) {
        if (!options.aspectRatio) {
          switch (mode) {
          case 'e':
            pos[1] = f.y2;
            break;
          case 'w':
            pos[1] = f.y2;
            break;
          case 'n':
            pos[0] = f.x2;
            break;
          case 's':
            pos[0] = f.x2;
            break;
          }
        } else {
          switch (mode) {
          case 'e':
            pos[1] = f.y + 1;
            break;
          case 'w':
            pos[1] = f.y + 1;
            break;
          case 'n':
            pos[0] = f.x + 1;
            break;
          case 's':
            pos[0] = f.x + 1;
            break;
          }
        }
        Coords.setCurrent(pos);
        Selection.update();
      };
    }
    //}}}
    function createMover(pos) //{{{
    {
      var lloc = pos;
      KeyManager.watchKeys();

      return function (pos) {
        Coords.moveOffset([pos[0] - lloc[0], pos[1] - lloc[1]]);
        lloc = pos;

        Selection.update();
      };
    }
    //}}}
    function oppLockCorner(ord) //{{{
    {
      switch (ord) {
      case 'n':
        return 'sw';
      case 's':
        return 'nw';
      case 'e':
        return 'nw';
      case 'w':
        return 'ne';
      case 'ne':
        return 'sw';
      case 'nw':
        return 'se';
      case 'se':
        return 'nw';
      case 'sw':
        return 'ne';
      }
    }
    //}}}
    function createDragger(ord) //{{{
    {
      return function (e) {
        if (options.disabled) {
          return false;
        }
        if ((ord === 'move') && !options.allowMove) {
          return false;
        }
        
        // Fix position of crop area when dragged the very first time.
        // Necessary when crop image is in a hidden element when page is loaded.
        docOffset = getPos($img);

        btndown = true;
        startDragMode(ord, mouseAbs(e));
        e.stopPropagation();
        e.preventDefault();
        return false;
      };
    }
    //}}}
    function presize($obj, w, h) //{{{
    {
      var nw = $obj.width(),
          nh = $obj.height();
      if ((nw > w) && w > 0) {
        nw = w;
        nh = (w / $obj.width()) * $obj.height();
      }
      if ((nh > h) && h > 0) {
        nh = h;
        nw = (h / $obj.height()) * $obj.width();
      }
      xscale = $obj.width() / nw;
      yscale = $obj.height() / nh;
      $obj.width(nw).height(nh);
    }
    //}}}
    function unscale(c) //{{{
    {
      return {
        x: c.x * xscale,
        y: c.y * yscale,
        x2: c.x2 * xscale,
        y2: c.y2 * yscale,
        w: c.w * xscale,
        h: c.h * yscale
      };
    }
    //}}}
    function doneSelect(pos) //{{{
    {
      var c = Coords.getFixed();
      Selection.enableHandles();
      Selection.done();
    }
    //}}}
    function selectDrag(pos) //{{{
    {
      Coords.setCurrent(pos);
      Selection.update();
    }
    //}}}
    function newTracker() //{{{
    {
      var trk = $('<div></div>').addClass(cssClass('tracker'));
      trk.css({
        opacity: 0,
        backgroundColor: 'white'
      });
      return trk;
    }
    //}}}

    // }}}
    // Initialization {{{
    // Sanitize some options {{{
    if (typeof(obj) !== 'object') {
      obj = $(obj)[0];
    }
    if (typeof(opt) !== 'object') {
      opt = {};
    }
    // }}}
    setOptions(opt);
    // Initialize some jQuery objects {{{
    // The values are SET on the image(s) for the interface
    // If the original image has any of these set, they will be reset
    // However, if you destroy() the Jcrop instance the original image's
    // character in the DOM will be as you left it.
    var img_css = {
      border: 'none',
      visibility: 'visible',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: 0,
      left: 0
    };

    var $origimg = $(obj),
      img_mode = true;

    if (obj.tagName == 'IMG') {
      // Fix size of crop image.
      // Necessary when crop image is within a hidden element when page is loaded.
      if ($origimg[0].width != 0 && $origimg[0].height != 0) {
        // Obtain dimensions from contained img element.
        $origimg.width($origimg[0].width);
        $origimg.height($origimg[0].height);
      } else {
        // Obtain dimensions from temporary image in case the original is not loaded yet (e.g. IE 7.0). 
        var tempImage = new Image();
        tempImage.src = $origimg[0].src;
        $origimg.width(tempImage.width);
        $origimg.height(tempImage.height);
      } 

      var $img = $origimg.clone().removeAttr('id').css(img_css).show();

      $img.width($origimg.width());
      $img.height($origimg.height());
      $origimg.after($img).hide();

    } else {
      $img = $origimg.css(img_css).show();
      img_mode = false;
      if (options.shade === null) { options.shade = true; }
    }

    presize($img, options.boxWidth, options.boxHeight);

    var boundx = $img.width(),
        boundy = $img.height(),

        $div = $('<div />').width(boundx).height(boundy).addClass(cssClass('holder')).css({
          position: 'relative',
          backgroundColor: options.bgColor
        }).insertAfter($origimg).append($img);

    if (options.addClass) {
      $div.addClass(options.addClass);
    }

    var $img2 = $('<div />'),

        $img_holder = $('<div />') 
        .width('100%').height('100%').css({
          zIndex: 310,
          position: 'absolute',
          overflow: 'hidden'
        }),

        $sel = $('<div />') 
        .css({
          position: 'absolute',
          zIndex: 600
        }).dblclick(function(){
          var c = Coords.getFixed();
          options.onDblClick.call(api,c);
        }).insertBefore($img).append($img_holder);

    if (img_mode) {

      $img2 = $('<img />')
          .attr('src', $img.attr('src')).css(img_css).width(boundx).height(boundy),

      $img_holder.append($img2);

    }

    var bound = options.boundary;
    var $trk = newTracker().width(boundx + (bound * 2)).height(boundy + (bound * 2)).css({
      position: 'absolute',
      top: px(-bound),
      left: px(-bound),
      zIndex: 290
    });

    /* }}} */
    // Set more variables {{{
    var bgcolor = options.bgColor,
        bgopacity = options.bgOpacity,
        xlimit, ylimit, xmin, ymin, xscale, yscale, enabled = true,
        btndown, animating, shift_down;

    docOffset = getPos($img);
    // }}}
    // }}}
    // Internal Modules {{{
    // Touch Module {{{ 
    var Touch = (function () {
      // Touch support detection function adapted (under MIT License)
      // from code by Jeffrey Sambells - http://github.com/iamamused/
      function hasTouchSupport() {
        var support = {},
            events = ['touchstart', 'touchmove', 'touchend'],
            el = document.createElement('div'), i;

        try {
          for(i=0; i<events.length; i++) {
            var eventName = events[i];
            eventName = 'on' + eventName;
            var isSupported = (eventName in el);
            if (!isSupported) {
              el.setAttribute(eventName, 'return;');
              isSupported = typeof el[eventName] == 'function';
            }
            support[events[i]] = isSupported;
          }
          return support.touchstart && support.touchend && support.touchmove;
        }
        catch(err) {
          return false;
        }
      }

      function detectSupport() {
        if ((options.touchSupport === true) || (options.touchSupport === false)) return options.touchSupport;
          else return hasTouchSupport();
      }
      return {
        createDragger: function (ord) {
          return function (e) {
            e.pageX = e.originalEvent.changedTouches[0].pageX;
            e.pageY = e.originalEvent.changedTouches[0].pageY;
            if (options.disabled) {
              return false;
            }
            if ((ord === 'move') && !options.allowMove) {
              return false;
            }
            btndown = true;
            startDragMode(ord, mouseAbs(e));
            e.stopPropagation();
            e.preventDefault();
            return false;
          };
        },
        isSupported: hasTouchSupport,
        support: detectSupport()
      };
    }());
    // }}}
    // Coords Module {{{
    var Coords = (function () {
      var x1 = 0,
          y1 = 0,
          x2 = 0,
          y2 = 0,
          ox, oy;

      function setPressed(pos) //{{{
      {
        pos = rebound(pos);
        x2 = x1 = pos[0];
        y2 = y1 = pos[1];
      }
      //}}}
      function setCurrent(pos) //{{{
      {
        pos = rebound(pos);
        ox = pos[0] - x2;
        oy = pos[1] - y2;
        x2 = pos[0];
        y2 = pos[1];
      }
      //}}}
      function getOffset() //{{{
      {
        return [ox, oy];
      }
      //}}}
      function moveOffset(offset) //{{{
      {
        var ox = offset[0],
            oy = offset[1];

        if (0 > x1 + ox) {
          ox -= ox + x1;
        }
        if (0 > y1 + oy) {
          oy -= oy + y1;
        }

        if (boundy < y2 + oy) {
          oy += boundy - (y2 + oy);
        }
        if (boundx < x2 + ox) {
          ox += boundx - (x2 + ox);
        }

        x1 += ox;
        x2 += ox;
        y1 += oy;
        y2 += oy;
      }
      //}}}
      function getCorner(ord) //{{{
      {
        var c = getFixed();
        switch (ord) {
        case 'ne':
          return [c.x2, c.y];
        case 'nw':
          return [c.x, c.y];
        case 'se':
          return [c.x2, c.y2];
        case 'sw':
          return [c.x, c.y2];
        }
      }
      //}}}
      function getFixed() //{{{
      {
        if (!options.aspectRatio) {
          return getRect();
        }
        // This function could use some optimization I think...
        var aspect = options.aspectRatio,
            min_x = options.minSize[0] / xscale,
            
            
            //min_y = options.minSize[1]/yscale,
            max_x = options.maxSize[0] / xscale,
            max_y = options.maxSize[1] / yscale,
            rw = x2 - x1,
            rh = y2 - y1,
            rwa = Math.abs(rw),
            rha = Math.abs(rh),
            real_ratio = rwa / rha,
            xx, yy, w, h;

        if (max_x === 0) {
          max_x = boundx * 10;
        }
        if (max_y === 0) {
          max_y = boundy * 10;
        }
        if (real_ratio < aspect) {
          yy = y2;
          w = rha * aspect;
          xx = rw < 0 ? x1 - w : w + x1;

          if (xx < 0) {
            xx = 0;
            h = Math.abs((xx - x1) / aspect);
            yy = rh < 0 ? y1 - h : h + y1;
          } else if (xx > boundx) {
            xx = boundx;
            h = Math.abs((xx - x1) / aspect);
            yy = rh < 0 ? y1 - h : h + y1;
          }
        } else {
          xx = x2;
          h = rwa / aspect;
          yy = rh < 0 ? y1 - h : y1 + h;
          if (yy < 0) {
            yy = 0;
            w = Math.abs((yy - y1) * aspect);
            xx = rw < 0 ? x1 - w : w + x1;
          } else if (yy > boundy) {
            yy = boundy;
            w = Math.abs(yy - y1) * aspect;
            xx = rw < 0 ? x1 - w : w + x1;
          }
        }

        // Magic %-)
        if (xx > x1) { // right side
          if (xx - x1 < min_x) {
            xx = x1 + min_x;
          } else if (xx - x1 > max_x) {
            xx = x1 + max_x;
          }
          if (yy > y1) {
            yy = y1 + (xx - x1) / aspect;
          } else {
            yy = y1 - (xx - x1) / aspect;
          }
        } else if (xx < x1) { // left side
          if (x1 - xx < min_x) {
            xx = x1 - min_x;
          } else if (x1 - xx > max_x) {
            xx = x1 - max_x;
          }
          if (yy > y1) {
            yy = y1 + (x1 - xx) / aspect;
          } else {
            yy = y1 - (x1 - xx) / aspect;
          }
        }

        if (xx < 0) {
          x1 -= xx;
          xx = 0;
        } else if (xx > boundx) {
          x1 -= xx - boundx;
          xx = boundx;
        }

        if (yy < 0) {
          y1 -= yy;
          yy = 0;
        } else if (yy > boundy) {
          y1 -= yy - boundy;
          yy = boundy;
        }

        return makeObj(flipCoords(x1, y1, xx, yy));
      }
      //}}}
      function rebound(p) //{{{
      {
        if (p[0] < 0) {
          p[0] = 0;
        }
        if (p[1] < 0) {
          p[1] = 0;
        }

        if (p[0] > boundx) {
          p[0] = boundx;
        }
        if (p[1] > boundy) {
          p[1] = boundy;
        }

        return [p[0], p[1]];
      }
      //}}}
      function flipCoords(x1, y1, x2, y2) //{{{
      {
        var xa = x1,
            xb = x2,
            ya = y1,
            yb = y2;
        if (x2 < x1) {
          xa = x2;
          xb = x1;
        }
        if (y2 < y1) {
          ya = y2;
          yb = y1;
        }
        return [xa, ya, xb, yb];
      }
      //}}}
      function getRect() //{{{
      {
        var xsize = x2 - x1,
            ysize = y2 - y1,
            delta;

        if (xlimit && (Math.abs(xsize) > xlimit)) {
          x2 = (xsize > 0) ? (x1 + xlimit) : (x1 - xlimit);
        }
        if (ylimit && (Math.abs(ysize) > ylimit)) {
          y2 = (ysize > 0) ? (y1 + ylimit) : (y1 - ylimit);
        }

        if (ymin / yscale && (Math.abs(ysize) < ymin / yscale)) {
          y2 = (ysize > 0) ? (y1 + ymin / yscale) : (y1 - ymin / yscale);
        }
        if (xmin / xscale && (Math.abs(xsize) < xmin / xscale)) {
          x2 = (xsize > 0) ? (x1 + xmin / xscale) : (x1 - xmin / xscale);
        }

        if (x1 < 0) {
          x2 -= x1;
          x1 -= x1;
        }
        if (y1 < 0) {
          y2 -= y1;
          y1 -= y1;
        }
        if (x2 < 0) {
          x1 -= x2;
          x2 -= x2;
        }
        if (y2 < 0) {
          y1 -= y2;
          y2 -= y2;
        }
        if (x2 > boundx) {
          delta = x2 - boundx;
          x1 -= delta;
          x2 -= delta;
        }
        if (y2 > boundy) {
          delta = y2 - boundy;
          y1 -= delta;
          y2 -= delta;
        }
        if (x1 > boundx) {
          delta = x1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }
        if (y1 > boundy) {
          delta = y1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }

        return makeObj(flipCoords(x1, y1, x2, y2));
      }
      //}}}
      function makeObj(a) //{{{
      {
        return {
          x: a[0],
          y: a[1],
          x2: a[2],
          y2: a[3],
          w: a[2] - a[0],
          h: a[3] - a[1]
        };
      }
      //}}}

      return {
        flipCoords: flipCoords,
        setPressed: setPressed,
        setCurrent: setCurrent,
        getOffset: getOffset,
        moveOffset: moveOffset,
        getCorner: getCorner,
        getFixed: getFixed
      };
    }());

    //}}}
    // Shade Module {{{
    var Shade = (function() {
      var enabled = false,
          holder = $('<div />').css({
            position: 'absolute',
            zIndex: 240,
            opacity: 0
          }),
          shades = {
            top: createShade(),
            left: createShade().height(boundy),
            right: createShade().height(boundy),
            bottom: createShade()
          };

      function resizeShades(w,h) {
        shades.left.css({ height: px(h) });
        shades.right.css({ height: px(h) });
      }
      function updateAuto()
      {
        return updateShade(Coords.getFixed());
      }
      function updateShade(c)
      {
        shades.top.css({
          left: px(c.x),
          width: px(c.w),
          height: px(c.y)
        });
        shades.bottom.css({
          top: px(c.y2),
          left: px(c.x),
          width: px(c.w),
          height: px(boundy-c.y2)
        });
        shades.right.css({
          left: px(c.x2),
          width: px(boundx-c.x2)
        });
        shades.left.css({
          width: px(c.x)
        });
      }
      function createShade() {
        return $('<div />').css({
          position: 'absolute',
          backgroundColor: options.shadeColor||options.bgColor
        }).appendTo(holder);
      }
      function enableShade() {
        if (!enabled) {
          enabled = true;
          holder.insertBefore($img);
          updateAuto();
          Selection.setBgOpacity(1,0,1);
          $img2.hide();

          setBgColor(options.shadeColor||options.bgColor,1);
          if (Selection.isAwake())
          {
            setOpacity(options.bgOpacity,1);
          }
            else setOpacity(1,1);
        }
      }
      function setBgColor(color,now) {
        colorChangeMacro(getShades(),color,now);
      }
      function disableShade() {
        if (enabled) {
          holder.remove();
          $img2.show();
          enabled = false;
          if (Selection.isAwake()) {
            Selection.setBgOpacity(options.bgOpacity,1,1);
          } else {
            Selection.setBgOpacity(1,1,1);
            Selection.disableHandles();
          }
          colorChangeMacro($div,0,1);
        }
      }
      function setOpacity(opacity,now) {
        if (enabled) {
          if (options.bgFade && !now) {
            holder.animate({
              opacity: 1-opacity
            },{
              queue: false,
              duration: options.fadeTime
            });
          }
          else holder.css({opacity:1-opacity});
        }
      }
      function refreshAll() {
        options.shade ? enableShade() : disableShade();
        if (Selection.isAwake()) setOpacity(options.bgOpacity);
      }
      function getShades() {
        return holder.children();
      }

      return {
        update: updateAuto,
        updateRaw: updateShade,
        getShades: getShades,
        setBgColor: setBgColor,
        enable: enableShade,
        disable: disableShade,
        resize: resizeShades,
        refresh: refreshAll,
        opacity: setOpacity
      };
    }());
    // }}}
    // Selection Module {{{
    var Selection = (function () {
      var awake,
          borders = {},
          handle = {},
          dragbar = {},
          seehandles = false;

      // Private Methods
      function insertBorder(type) //{{{
      {
        var jq = $('<div />').css({
          position: 'absolute'
        }).addClass(cssClass(type));
        $sel.append(jq);
        return jq;
      }
      //}}}
      function dragDiv(ord) //{{{
      {
        var jq = $('<div />').mousedown(createDragger(ord)).css({
          cursor: ord + '-resize',
          position: 'absolute'
        }).append('<div/>')
          .addClass('ord-'+ord);

        if (Touch.support) {
          jq.bind('touchstart.jcrop', Touch.createDragger(ord));
        }

        $sel.append(jq);
        return jq;
      }
      //}}}
      function insertHandle(ord) //{{{
      {
        return dragDiv(ord).addClass(cssClass('handle'));
      }
      //}}}
      function createBorders(li) //{{{
      {
        var cl,i;
        for (i = 0; i < li.length; i++) {
          switch(li[i]){
            case'n': cl='hline'; break;
            case's': cl='hline bottom'; break;
            case'e': cl='vline right'; break;
            case'w': cl='vline'; break;
          }
          borders[li[i]] = insertBorder(cl);
        }
      }
      //}}}
      function createHandles(li) //{{{
      {
        var i;
        for (i = 0; i < li.length; i++) {
          handle[li[i]] = insertHandle(li[i]);
        }
      }
      //}}}
      function moveto(x, y) //{{{
      {
        if (!options.shade) {
          $img2.css({
            top: px(-y),
            left: px(-x)
          });
        }
        $sel.css({
          top: px(y),
          left: px(x)
        });
      }
      //}}}
      function resize(w, h) //{{{
      {
        $sel.width(Math.round(w)).height(Math.round(h));
      }
      //}}}
      function refresh() //{{{
      {
        var c = Coords.getFixed();

        Coords.setPressed([c.x, c.y]);
        Coords.setCurrent([c.x2, c.y2]);

        updateVisible();
      }
      //}}}

      // Internal Methods
      function updateVisible(select) //{{{
      {
        if (awake) {
          return update(select);
        }
      }
      //}}}
      function update(select) //{{{
      {
        var c = Coords.getFixed();

        resize(c.w, c.h);
        moveto(c.x, c.y);
        if (options.shade) Shade.updateRaw(c);

        awake || show();

        if (select) {
          options.onSelect.call(api, unscale(c));
        } else {
          options.onChange.call(api, unscale(c));
        }
      }
      //}}}
      function setBgOpacity(opacity,force,now) //{{{
      {
        if (!awake && !force) return;
        if (options.bgFade && !now) {
          $img.animate({
            opacity: opacity
          },{
            queue: false,
            duration: options.fadeTime
          });
        } else {
          $img.css('opacity', opacity);
        }
      }
      //}}}
      function show() //{{{
      {
        $sel.show();

        if (options.shade) Shade.opacity(bgopacity);
          else setBgOpacity(bgopacity,true);

        awake = true;
      }
      //}}}
      function release() //{{{
      {
        disableHandles();
        $sel.hide();

        if (options.shade) Shade.opacity(1);
          else setBgOpacity(1);

        awake = false;
        options.onRelease.call(api);
      }
      //}}}
      function enableHandles() //{{{
      {
        seehandles = true;
        if (options.allowResize) {
          return true;
        }
      }
      //}}}
      function disableHandles() //{{{
      {
        seehandles = false;
      }
      //}}}
      function animMode(v) //{{{
      {
        if (v) {
          animating = true;
          disableHandles();
        } else {
          animating = false;
          enableHandles();
        }
      } 
      //}}}
      function done() //{{{
      {
        animMode(false);
        refresh();
      } 
      //}}}
      // Insert draggable elements {{{
      // Insert border divs for outline

      if ($.isArray(options.createHandles))
        createHandles(options.createHandles);

      if (options.drawBorders && $.isArray(options.createBorders))
        createBorders(options.createBorders);

      //}}}

      // This is a hack for iOS5 to support drag/move touch functionality
      $(document).bind('touchstart.jcrop-ios',function(e) {
        if ($(e.currentTarget).hasClass('jcrop-tracker')) e.stopPropagation();
      });

      var $track = newTracker().mousedown(createDragger('move')).css({
        cursor: 'move',
        position: 'absolute',
        zIndex: 360
      });

      if (Touch.support) {
        $track.bind('touchstart.jcrop', Touch.createDragger('move'));
      }

      $img_holder.append($track);
      disableHandles();

      return {
        updateVisible: updateVisible,
        update: update,
        release: release,
        refresh: refresh,
        isAwake: function () {
          return awake;
        },
        setCursor: function (cursor) {
          $track.css('cursor', cursor);
        },
        enableHandles: enableHandles,
        enableOnly: function () {
          seehandles = true;
        },
        disableHandles: disableHandles,
        animMode: animMode,
        setBgOpacity: setBgOpacity,
        done: done
      };
    }());
    
    //}}}
    // Tracker Module {{{
    var Tracker = (function () {
      var onMove = function () {},
          onDone = function () {},
          trackDoc = options.trackDocument;

      function toFront() //{{{
      {
        $trk.css({
          zIndex: 450
        });
        if (Touch.support) {
          $(document)
            .bind('touchmove.jcrop', trackTouchMove)
            .bind('touchend.jcrop', trackTouchEnd);
        }
        if (trackDoc) {
          $(document)
            .bind('mousemove.jcrop',trackMove)
            .bind('mouseup.jcrop',trackUp);
        }
      } 
      //}}}
      function toBack() //{{{
      {
        $trk.css({
          zIndex: 290
        });
        $(document).unbind('.jcrop');
      } 
      //}}}
      function trackMove(e) //{{{
      {
        onMove(mouseAbs(e));
        return false;
      } 
      //}}}
      function trackUp(e) //{{{
      {
        e.preventDefault();
        e.stopPropagation();

        if (btndown) {
          btndown = false;

          onDone(mouseAbs(e));

          if (Selection.isAwake()) {
            options.onSelect.call(api, unscale(Coords.getFixed()));
          }

          toBack();
          onMove = function () {};
          onDone = function () {};
        }

        return false;
      }
      //}}}
      function activateHandlers(move, done) //{{{
      {
        btndown = true;
        onMove = move;
        onDone = done;
        toFront();
        return false;
      }
      //}}}
      function trackTouchMove(e) //{{{
      {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        return trackMove(e);
      }
      //}}}
      function trackTouchEnd(e) //{{{
      {
        e.pageX = e.originalEvent.changedTouches[0].pageX;
        e.pageY = e.originalEvent.changedTouches[0].pageY;
        return trackUp(e);
      }
      //}}}

      if (!trackDoc) {
        $trk.mousemove(trackMove).mouseup(trackUp).mouseout(trackUp);
      }

      $img.before($trk);
      return {
        activateHandlers: activateHandlers
      };
    }());
    //}}}
    // KeyManager Module {{{
    var KeyManager = (function () {
      var $keymgr = $('<input type="radio" />').css({
        position: 'fixed',
        left: '-120px',
        width: '12px'
      }).addClass('jcrop-keymgr'),

        $keywrap = $('<div />').css({
          position: 'absolute',
          overflow: 'hidden'
        }).append($keymgr);

      function watchKeys() //{{{
      {
        if (options.keySupport) {
          $keymgr.show();
          $keymgr.focus();
        }
      }
      //}}}
      function onBlur(e) //{{{
      {
        $keymgr.hide();
      }
      //}}}
      function doNudge(e, x, y) //{{{
      {
        if (options.allowMove) {
          Coords.moveOffset([x, y]);
          Selection.updateVisible(true);
        }
        e.preventDefault();
        e.stopPropagation();
      }
      //}}}
      function parseKey(e) //{{{
      {
        if (e.ctrlKey || e.metaKey) {
          return true;
        }
        shift_down = e.shiftKey ? true : false;
        var nudge = shift_down ? 10 : 1;

        switch (e.keyCode) {
        case 37:
          doNudge(e, -nudge, 0);
          break;
        case 39:
          doNudge(e, nudge, 0);
          break;
        case 38:
          doNudge(e, 0, -nudge);
          break;
        case 40:
          doNudge(e, 0, nudge);
          break;
        case 9:
          return true;
        }

        return false;
      }
      //}}}

      if (options.keySupport) {
        $keymgr.keydown(parseKey).blur(onBlur);

        $keymgr.css({
          position: 'absolute',
          left: '-20px'
        });
        $keywrap.append($keymgr).insertBefore($img);
      }


      return {
        watchKeys: watchKeys
      };
    }());
    //}}}
    // }}}
    // API methods {{{
    function setClass(cname) //{{{
    {
      $div.removeClass().addClass(cssClass('holder')).addClass(cname);
    }
    //}}}
    function setSelect(rect) //{{{
    {
      setSelectRaw([rect[0] / xscale, rect[1] / yscale, rect[2] / xscale, rect[3] / yscale]);
      options.onSelect.call(api, unscale(Coords.getFixed()));
      Selection.enableHandles();
    }
    //}}}
    function setSelectRaw(l) //{{{
    {
      Coords.setPressed([l[0], l[1]]);
      Coords.setCurrent([l[2], l[3]]);
      Selection.update();
    }
    //}}}
    function tellSelect() //{{{
    {
      return unscale(Coords.getFixed());
    }
    //}}}
    function tellScaled() //{{{
    {
      return Coords.getFixed();
    }
    //}}}
    function setOptionsNew(opt) //{{{
    {
      setOptions(opt);
      interfaceUpdate();
    }
    //}}}
    function disableCrop() //{{{
    {
      options.disabled = true;
      Selection.disableHandles();
      Selection.setCursor('default');
    }
    //}}}
    function enableCrop() //{{{
    {
      options.disabled = false;
      interfaceUpdate();
    }
    //}}}
    function cancelCrop() //{{{
    {
      Selection.done();
      Tracker.activateHandlers(null, null);
    }
    //}}}
    function destroy() //{{{
    {
      $div.remove();
      $origimg.show();
      $origimg.css('visibility','visible');
      $(obj).removeData('Jcrop');
    }
    //}}}
    function colorChangeMacro($obj,color,now) {
      var mycolor = color || options.bgColor;
      if (options.bgFade && supportsColorFade() && options.fadeTime && !now) {
        $obj.animate({
          backgroundColor: mycolor
        }, {
          queue: false,
          duration: options.fadeTime
        });
      } else {
        $obj.css('backgroundColor', mycolor);
      }
    }
    function interfaceUpdate(alt) //{{{
    // This method tweaks the interface based on options object.
    // Called when options are changed and at end of initialization.
    {
      if (options.allowResize) {
        if (alt) {
          Selection.enableOnly();
        } else {
          Selection.enableHandles();
        }
      } else {
        Selection.disableHandles();
      }

      Selection.setCursor(options.allowMove ? 'move' : 'default');

      if (options.hasOwnProperty('trueSize')) {
        xscale = options.trueSize[0] / boundx;
        yscale = options.trueSize[1] / boundy;
      }

      if (options.hasOwnProperty('setSelect')) {
        setSelect(options.setSelect);
        Selection.done();
        delete(options.setSelect);
      }

      Shade.refresh();

      if (options.bgColor != bgcolor) {
        colorChangeMacro(
          options.shade? Shade.getShades(): $div,
          options.shade?
            (options.shadeColor || options.bgColor):
            options.bgColor
        );
        bgcolor = options.bgColor;
      }

      if (bgopacity != options.bgOpacity) {
        bgopacity = options.bgOpacity;
        if (options.shade) Shade.refresh();
          else Selection.setBgOpacity(bgopacity);
      }

      xlimit = options.maxSize[0] || 0;
      ylimit = options.maxSize[1] || 0;
      xmin = options.minSize[0] || 0;
      ymin = options.minSize[1] || 0;

      if (options.hasOwnProperty('outerImage')) {
        $img.attr('src', options.outerImage);
        delete(options.outerImage);
      }

      Selection.refresh();
    }
    //}}}
    //}}}

    interfaceUpdate(true);

    var api = {
      setSelect: setSelect,
      setOptions: setOptionsNew,
      tellSelect: tellSelect,
      tellScaled: tellScaled,
      setClass: setClass,

      disable: disableCrop,
      enable: enableCrop,
      cancel: cancelCrop,
      release: Selection.release,
      destroy: destroy,

      focus: KeyManager.watchKeys,

      getBounds: function () {
        return [boundx * xscale, boundy * yscale];
      },
      getWidgetSize: function () {
        return [boundx, boundy];
      },
      getScaleFactor: function () {
        return [xscale, yscale];
      },
      getOptions: function() {
        // careful: internal values are returned
        return options;
      },

      ui: {
        holder: $div,
        selection: $sel
      }
    };

    $origimg.data('Jcrop', api);
    return api;
  };
  $.fn.Jcrop = function (options, callback) //{{{
  {
    var api;
    // Iterate over each object, attach Jcrop
    this.each(function () {
      // If we've already attached to this object
      if ($(this).data('Jcrop')) {
        // The API can be requested this way (undocumented)
        if (options === 'api') return $(this).data('Jcrop');
        // Otherwise, we just reset the options...
        else $(this).data('Jcrop').setOptions(options);
      }
      // If we haven't been attached, preload and attach
      else {
        if (this.tagName == 'IMG')
          $.Jcrop.Loader(this,function(){
            $(this).css({display:'block',visibility:'hidden'});
            api = $.Jcrop(this, options);
            if ($.isFunction(callback)) callback.call(api);
          });
        else {
          $(this).css({display:'block',visibility:'hidden'});
          api = $.Jcrop(this, options);
          if ($.isFunction(callback)) callback.call(api);
        }
      }
    });

    // Return "this" so the object is chainable (jQuery-style)
    return this;
  };
  //}}}
  // $.Jcrop.Loader - basic image loader {{{

  $.Jcrop.Loader = function(imgobj,success,error){
    var $img = $(imgobj), img = $img[0];

    function completeCheck(){
      if (img.complete) {
        $img.unbind('.jcloader');
        if ($.isFunction(success)) success.call(img);
      }
      else window.setTimeout(completeCheck,50);
    }

    $img
      .bind('load.jcloader',completeCheck)
      .bind('error.jcloader',function(e){
        $img.unbind('.jcloader');
        if ($.isFunction(error)) error.call(img);
      });

    if (img.complete && $.isFunction(success)){
      $img.unbind('.jcloader');
      success.call(img);
    }
  };

  //}}}
  // Global Defaults {{{
  $.Jcrop.defaults = {

    // Basic Settings
    allowMove: true,
    allowResize: true,

    trackDocument: true,

    // Styling Options
    baseClass: 'jcrop',
    addClass: null,
    bgColor: 'black',
    bgOpacity: 0.6,
    bgFade: false,

    aspectRatio: 0,
    keySupport: true,
    createHandles: ['n','s','e','w','nw','ne','se','sw'],
    createBorders: ['n','s','e','w'],
    drawBorders: true,
    dragEdges: true,
    fixedSupport: true,
    touchSupport: null,

    shade: null,

    boxWidth: 0,
    boxHeight: 0,
    boundary: 2,
    fadeTime: 400,
    animationDelay: 20,
    swingSpeed: 3,

    maxSize: [0, 0],
    minSize: [0, 0],

    // Callbacks / Event Handlers
    onChange: function () {},
    onSelect: function () {},
    onDblClick: function () {},
    onRelease: function () {}
  };

  // }}}
}(uploadcare.jQuery));
(function() {
  var $, utils;

  $ = uploadcare.jQuery, utils = uploadcare.utils;

  uploadcare.namespace('crop', function(ns) {
    return ns.CropWidget = (function() {
      var cropModifierRegExp;

      function CropWidget(element, originalSize, crop) {
        this.element = element;
        this.originalSize = originalSize;
        if (crop == null) {
          crop = {};
        }
        this.__api = $.Jcrop(this.element[0], {
          trueSize: this.originalSize,
          addClass: 'uploadcare-crop-widget',
          createHandles: ['nw', 'ne', 'se', 'sw'],
          bgColor: 'transparent',
          bgOpacity: .8
        });
        this.setCrop(crop);
        this.setSelection();
      }

      CropWidget.prototype.setCrop = function(crop) {
        this.crop = crop;
        return this.__api.setOptions({
          aspectRatio: crop.preferedSize ? crop.preferedSize[0] / crop.preferedSize[1] : 0,
          minSize: crop.notLess ? utils.fitSize(crop.preferedSize, this.originalSize) : [0, 0]
        });
      };

      CropWidget.prototype.setSelection = function(selection) {
        var center, left, size, top;
        if (selection) {
          center = selection.center;
          size = [selection.width, selection.height];
        } else {
          center = true;
          size = this.originalSize;
        }
        if (this.crop.preferedSize) {
          size = utils.fitSize(this.crop.preferedSize, size, true);
        }
        if (center) {
          left = (this.originalSize[0] - size[0]) / 2;
          top = (this.originalSize[1] - size[1]) / 2;
        } else {
          left = selection.left || 0;
          top = selection.top || 0;
        }
        return this.__api.setSelect([left, top, size[0] + left, size[1] + top]);
      };

      cropModifierRegExp = /-\/crop\/([0-9]+)x([0-9]+)(\/(center|([0-9]+),([0-9]+)))?\//i;

      CropWidget.prototype.__parseModifiers = function(modifiers) {
        var raw;
        if (raw = modifiers != null ? modifiers.match(cropModifierRegExp) : void 0) {
          return {
            width: parseInt(raw[1], 10),
            height: parseInt(raw[2], 10),
            center: raw[4] === 'center',
            left: parseInt(raw[5], 10) || void 0,
            top: parseInt(raw[6], 10) || void 0
          };
        }
      };

      CropWidget.prototype.setSelectionFromModifiers = function(modifiers) {
        return this.setSelection(this.__parseModifiers(modifiers));
      };

      CropWidget.prototype.getSelection = function() {
        var coords, left, top;
        coords = this.__api.tellSelect();
        left = Math.round(Math.max(0, coords.x));
        top = Math.round(Math.max(0, coords.y));
        return {
          left: left,
          top: top,
          width: Math.round(Math.min(this.originalSize[0], coords.x2)) - left,
          height: Math.round(Math.min(this.originalSize[1], coords.y2)) - top
        };
      };

      CropWidget.prototype.applySelectionToFile = function(file) {
        return utils.applyCropSelectionToFile(file, this.crop, this.originalSize, this.getSelection());
      };

      return CropWidget;

    })();
  });

}).call(this);
(function() {
  var $, namespace, s, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  namespace = uploadcare.namespace, s = uploadcare.settings, $ = uploadcare.jQuery, utils = uploadcare.utils;

  namespace('files', function(ns) {
    return ns.BaseFile = (function() {
      function BaseFile(param, settings, sourceInfo) {
        var _base;
        this.settings = settings;
        this.sourceInfo = sourceInfo != null ? sourceInfo : {};
        this.__extendApi = __bind(this.__extendApi, this);
        this.__cancel = __bind(this.__cancel, this);
        this.__resolveApi = __bind(this.__resolveApi, this);
        this.__rejectApi = __bind(this.__rejectApi, this);
        this.__runValidators = __bind(this.__runValidators, this);
        this.__fileInfo = __bind(this.__fileInfo, this);
        this.__handleFileData = __bind(this.__handleFileData, this);
        this.__updateInfo = __bind(this.__updateInfo, this);
        this.__completeUpload = __bind(this.__completeUpload, this);
        this.fileId = null;
        this.fileName = null;
        this.sanitizedName = null;
        this.fileSize = null;
        this.isStored = null;
        this.cdnUrlModifiers = null;
        this.isImage = null;
        this.imageInfo = null;
        this.mimeType = null;
        this.s3Bucket = null;
        (_base = this.sourceInfo).source || (_base.source = this.sourceName);
        this.onInfoReady = $.Callbacks('once memory');
        this.__setupValidation();
        this.__initApi();
      }

      BaseFile.prototype.__startUpload = function() {
        return $.Deferred().resolve();
      };

      BaseFile.prototype.__completeUpload = function() {
        var check, logger, ncalls, timeout,
          _this = this;
        ncalls = 0;
        if (this.settings.debugUploads) {
          utils.debug("Load file info.", this.fileId, this.settings.publicKey);
          logger = setInterval(function() {
            return utils.debug("Still waiting for file ready.", ncalls, _this.fileId, _this.settings.publicKey);
          }, 5000);
          this.apiDeferred.done(function() {
            return utils.debug("File uploaded.", ncalls, _this.fileId, _this.settings.publicKey);
          }).always(function() {
            return clearInterval(logger);
          });
        }
        timeout = 100;
        return (check = function() {
          if (_this.apiDeferred.state() === 'pending') {
            ncalls += 1;
            return _this.__updateInfo().done(function() {
              setTimeout(check, timeout);
              return timeout += 50;
            });
          }
        })();
      };

      BaseFile.prototype.__updateInfo = function() {
        var _this = this;
        return utils.jsonp("" + this.settings.urlBase + "/info/", {
          jsonerrors: 1,
          file_id: this.fileId,
          pub_key: this.settings.publicKey,
          wait_is_ready: +this.onInfoReady.fired()
        }).fail(function(reason) {
          if (_this.settings.debugUploads) {
            utils.log("Can't load file info. Probably removed.", _this.fileId, _this.settings.publicKey, reason);
          }
          return _this.__rejectApi('info');
        }).done(this.__handleFileData);
      };

      BaseFile.prototype.__handleFileData = function(data) {
        this.fileName = data.original_filename;
        this.sanitizedName = data.filename;
        this.fileSize = data.size;
        this.isImage = data.is_image;
        this.imageInfo = data.image_info;
        this.mimeType = data.mime_type;
        this.isStored = data.is_stored;
        this.s3Bucket = data.s3_bucket;
        if (data.default_effects) {
          this.cdnUrlModifiers = "-/" + data.default_effects;
        }
        if (this.s3Bucket && this.cdnUrlModifiers) {
          this.__rejectApi('baddata');
        }
        if (!this.onInfoReady.fired()) {
          this.onInfoReady.fire(this.__fileInfo());
        }
        if (data.is_ready) {
          return this.__resolveApi();
        }
      };

      BaseFile.prototype.__progressInfo = function() {
        var _ref;
        return {
          state: this.__progressState,
          uploadProgress: this.__progress,
          progress: (_ref = this.__progressState) === 'ready' || _ref === 'error' ? 1 : this.__progress * 0.9,
          incompleteFileInfo: this.__fileInfo()
        };
      };

      BaseFile.prototype.__fileInfo = function() {
        var urlBase;
        if (this.s3Bucket) {
          urlBase = "https://" + this.s3Bucket + ".s3.amazonaws.com/" + this.fileId + "/" + this.sanitizedName;
        } else {
          urlBase = "" + this.settings.cdnBase + "/" + this.fileId + "/";
        }
        return {
          uuid: this.fileId,
          name: this.fileName,
          size: this.fileSize,
          isStored: this.isStored,
          isImage: !this.s3Bucket && this.isImage,
          originalImageInfo: this.imageInfo,
          mimeType: this.mimeType,
          originalUrl: this.fileId ? urlBase : null,
          cdnUrl: this.fileId ? "" + urlBase + (this.cdnUrlModifiers || '') : null,
          cdnUrlModifiers: this.cdnUrlModifiers,
          sourceInfo: this.sourceInfo
        };
      };

      BaseFile.prototype.__setupValidation = function() {
        this.validators = this.settings.validators || this.settings.__validators || [];
        if (this.settings.imagesOnly) {
          this.validators.push(function(info) {
            if (info.isImage === false) {
              throw new Error('image');
            }
          });
        }
        return this.onInfoReady.add(this.__runValidators);
      };

      BaseFile.prototype.__runValidators = function(info) {
        var err, v, _i, _len, _ref, _results;
        info = info || this.__fileInfo();
        try {
          _ref = this.validators;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _results.push(v(info));
          }
          return _results;
        } catch (_error) {
          err = _error;
          return this.__rejectApi(err.message);
        }
      };

      BaseFile.prototype.__initApi = function() {
        this.apiDeferred = $.Deferred();
        this.__progressState = 'uploading';
        this.__progress = 0;
        return this.__notifyApi();
      };

      BaseFile.prototype.__notifyApi = function() {
        return this.apiDeferred.notify(this.__progressInfo());
      };

      BaseFile.prototype.__rejectApi = function(err) {
        this.__progressState = 'error';
        this.__notifyApi();
        return this.apiDeferred.reject(err, this.__fileInfo());
      };

      BaseFile.prototype.__resolveApi = function() {
        this.__progressState = 'ready';
        this.__notifyApi();
        return this.apiDeferred.resolve(this.__fileInfo());
      };

      BaseFile.prototype.__cancel = function() {
        return this.__rejectApi('user');
      };

      BaseFile.prototype.__extendApi = function(api) {
        var _this = this;
        api.cancel = this.__cancel;
        api.pipe = api.then = function() {
          return _this.__extendApi(utils.fixedPipe.apply(utils, [api].concat(__slice.call(arguments))));
        };
        return api;
      };

      BaseFile.prototype.promise = function() {
        var op,
          _this = this;
        if (!this.__apiPromise) {
          this.__apiPromise = this.__extendApi(this.apiDeferred.promise());
          this.__runValidators();
          if (this.apiDeferred.state() === 'pending') {
            op = this.__startUpload();
            op.done(function() {
              _this.__progressState = 'uploaded';
              _this.__progress = 1;
              _this.__notifyApi();
              return _this.__completeUpload();
            });
            op.progress(function(progress) {
              if (progress > _this.__progress) {
                _this.__progress = progress;
                return _this.__notifyApi();
              }
            });
            op.fail(function() {
              return _this.__rejectApi('upload');
            });
            this.apiDeferred.always(op.reject);
          }
        }
        return this.__apiPromise;
      };

      return BaseFile;

    })();
  });

  namespace('utils', function(utils) {
    utils.isFile = function(obj) {
      return obj && obj.done && obj.fail && obj.cancel;
    };
    return utils.valueToFile = function(value, settings) {
      if (value && !utils.isFile(value)) {
        value = uploadcare.fileFrom('uploaded', value, settings);
      }
      return value || null;
    };
  });

}).call(this);
(function() {
  var $, Blob, FileReader, URL, utils, _ref, _ref1;

  $ = uploadcare.jQuery, utils = uploadcare.utils, (_ref = uploadcare.utils, (_ref1 = _ref.abilities, Blob = _ref1.Blob, FileReader = _ref1.FileReader, URL = _ref1.URL));

  uploadcare.namespace('utils.image', function(ns) {
    var DataView, taskRunner;
    DataView = window.DataView;
    taskRunner = utils.taskRunner(1);
    ns.shrinkFile = function(file, settings) {
      var df,
        _this = this;
      df = $.Deferred();
      if (!(URL && DataView && Blob)) {
        return df.reject('support');
      }
      taskRunner(function(release) {
        var op;
        df.always(release);
        op = utils.imageLoader(URL.createObjectURL(file));
        op.always(function(e) {
          return URL.revokeObjectURL(e.target.src);
        });
        op.fail(function() {
          return df.reject('not image');
        });
        return op.done(function(e) {
          df.notify(.10);
          return ns.getExif(file).always(function(exif) {
            var isJPEG;
            df.notify(.2);
            isJPEG = this.state() === 'resolved';
            op = ns.shrinkImage(e.target, settings);
            op.progress(function(progress) {
              return df.notify(.2 + progress * .6);
            });
            op.fail(df.reject);
            op.done(function(canvas) {
              var format, quality;
              format = 'image/jpeg';
              quality = settings.quality || 0.8;
              if (!isJPEG && ns.hasTransparency(canvas)) {
                format = 'image/png';
                quality = void 0;
              }
              return utils.canvasToBlob(canvas, format, quality, function(blob) {
                canvas.width = canvas.height = 1;
                df.notify(.9);
                if (exif) {
                  op = ns.replaceJpegChunk(blob, 0xe1, [exif.buffer]);
                  op.done(df.resolve);
                  return op.fail(function() {
                    return df.resolve(blob);
                  });
                } else {
                  return df.resolve(blob);
                }
              });
            });
            return e = null;
          });
        });
      });
      return df.promise();
    };
    ns.shrinkImage = function(img, settings) {
      var df, h, maxSize, maxSquare, originalW, ratio, run, sH, sW, step, w;
      df = $.Deferred();
      step = 0.71;
      if (img.width * step * img.height * step < settings.size) {
        return df.reject('not required');
      }
      sW = originalW = img.width;
      sH = img.height;
      ratio = sW / sH;
      w = Math.floor(Math.sqrt(settings.size * ratio));
      h = Math.floor(settings.size / Math.sqrt(settings.size * ratio));
      maxSquare = 5000000;
      maxSize = 4096;
      (run = function() {
        if (sW <= w) {
          df.resolve(img);
          return;
        }
        return utils.defer(function() {
          var canvas;
          sW = Math.round(sW * step);
          sH = Math.round(sH * step);
          if (sW * step < w) {
            sW = w;
            sH = h;
          }
          if (sW * sH > maxSquare) {
            sW = Math.floor(Math.sqrt(maxSquare * ratio));
            sH = Math.floor(maxSquare / Math.sqrt(maxSquare * ratio));
          }
          if (sW > maxSize) {
            sW = maxSize;
            sH = Math.round(sW / ratio);
          }
          if (sH > maxSize) {
            sH = maxSize;
            sW = Math.round(ratio * sH);
          }
          canvas = document.createElement('canvas');
          canvas.width = sW;
          canvas.height = sH;
          canvas.getContext('2d').drawImage(img, 0, 0, sW, sH);
          img.src = '//:0';
          img.width = img.height = 1;
          img = canvas;
          df.notify((originalW - sW) / (originalW - w));
          return run();
        });
      })();
      return df.promise();
    };
    ns.drawFileToCanvas = function(file, mW, mH, bg, maxSource) {
      var df, op;
      df = $.Deferred();
      if (!URL) {
        return df.reject('support');
      }
      op = utils.imageLoader(URL.createObjectURL(file));
      op.always(function(e) {
        return URL.revokeObjectURL(e.target.src);
      });
      op.fail(function() {
        return df.reject('not image');
      });
      op.done(function(e) {
        var img;
        img = e.target;
        df.always(function() {
          return img.src = '//:0';
        });
        if (maxSource && img.width * img.height > maxSource) {
          return df.reject('max source');
        }
        return ns.getExif(file).always(function(exif) {
          var canvas, ctx, dH, dW, orientation, sSize, swap, trns, _ref2, _ref3;
          orientation = ns.parseExifOrientation(exif) || 1;
          swap = orientation > 4;
          sSize = swap ? [img.height, img.width] : [img.width, img.height];
          _ref2 = utils.fitSize(sSize, [mW, mH]), dW = _ref2[0], dH = _ref2[1];
          trns = [[1, 0, 0, 1, 0, 0], [-1, 0, 0, 1, dW, 0], [-1, 0, 0, -1, dW, dH], [1, 0, 0, -1, 0, dH], [0, 1, 1, 0, 0, 0], [0, 1, -1, 0, dW, 0], [0, -1, -1, 0, dW, dH], [0, -1, 1, 0, 0, dH]][orientation - 1];
          if (!trns) {
            return df.reject('bad image');
          }
          canvas = document.createElement('canvas');
          canvas.width = dW;
          canvas.height = dH;
          ctx = canvas.getContext('2d');
          ctx.transform.apply(ctx, trns);
          if (swap) {
            _ref3 = [dH, dW], dW = _ref3[0], dH = _ref3[1];
          }
          if (bg) {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, dW, dH);
          }
          ctx.drawImage(img, 0, 0, dW, dH);
          return df.resolve(canvas, sSize);
        });
      });
      return df.promise();
    };
    ns.readJpegChunks = function(file) {
      var df, pos, readNext, readNextChunk, readToView;
      readToView = function(file, cb) {
        var reader;
        reader = new FileReader();
        reader.onload = function() {
          return cb(new DataView(reader.result));
        };
        reader.onerror = function(e) {
          return df.reject('reader', e);
        };
        return reader.readAsArrayBuffer(file);
      };
      readNext = function() {
        return readToView(file.slice(pos, pos + 128), function(view) {
          var i, _i, _ref2;
          for (i = _i = 0, _ref2 = view.byteLength; 0 <= _ref2 ? _i < _ref2 : _i > _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
            if (view.getUint8(i) === 0xff) {
              pos += i;
              break;
            }
          }
          return readNextChunk();
        });
      };
      readNextChunk = function() {
        var startPos;
        startPos = pos;
        return readToView(file.slice(pos, pos += 4), function(view) {
          var length, marker;
          if (view.byteLength !== 4 || view.getUint8(0) !== 0xff) {
            return df.reject('corrupted');
          }
          marker = view.getUint8(1);
          if (marker === 0xda) {
            return df.resolve();
          }
          length = view.getUint16(2) - 2;
          return readToView(file.slice(pos, pos += length), function(view) {
            if (view.byteLength !== length) {
              return df.reject('corrupted');
            }
            df.notify(startPos, length, marker, view);
            return readNext();
          });
        });
      };
      df = $.Deferred();
      if (!(FileReader && DataView)) {
        return df.reject('support');
      }
      pos = 2;
      readToView(file.slice(0, 2), function(view) {
        if (view.getUint16(0) !== 0xffd8) {
          return df.reject('not jpeg');
        }
        return readNext();
      });
      return df.promise();
    };
    ns.replaceJpegChunk = function(blob, marker, chunks) {
      var df, oldChunkLength, oldChunkPos, op;
      df = $.Deferred();
      oldChunkPos = [];
      oldChunkLength = [];
      op = ns.readJpegChunks(blob);
      op.fail(df.reject);
      op.progress(function(pos, length, oldMarker) {
        if (oldMarker === marker) {
          oldChunkPos.push(pos);
          return oldChunkLength.push(length);
        }
      });
      op.done(function() {
        var chunk, i, intro, newChunks, pos, _i, _j, _len, _ref2;
        newChunks = [blob.slice(0, 2)];
        for (_i = 0, _len = chunks.length; _i < _len; _i++) {
          chunk = chunks[_i];
          intro = new DataView(new ArrayBuffer(4));
          intro.setUint16(0, 0xff00 + marker);
          intro.setUint16(2, chunk.byteLength + 2);
          newChunks.push(intro.buffer);
          newChunks.push(chunk);
        }
        pos = 2;
        for (i = _j = 0, _ref2 = oldChunkPos.length; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
          if (oldChunkPos[i] > pos) {
            newChunks.push(blob.slice(pos, oldChunkPos[i]));
          }
          pos = oldChunkPos[i] + oldChunkLength[i] + 4;
        }
        newChunks.push(blob.slice(pos, blob.size));
        return df.resolve(new Blob(newChunks, {
          type: blob.type
        }));
      });
      return df.promise();
    };
    ns.getExif = function(file) {
      var exif, op;
      exif = null;
      op = ns.readJpegChunks(file);
      op.progress(function(pos, l, marker, view) {
        if (!exif && marker === 0xe1) {
          if (view.byteLength >= 14) {
            if (view.getUint32(0) === 0x45786966 && view.getUint16(4) === 0) {
              return exif = view;
            }
          }
        }
      });
      return op.then(function() {
        return exif;
      }, function(reason) {
        return $.Deferred().reject(exif, reason);
      });
    };
    ns.parseExifOrientation = function(exif) {
      var count, i, little, offset, _i;
      if (!exif || exif.byteLength < 14 || exif.getUint32(0) !== 0x45786966 || exif.getUint16(4) !== 0 || exif.getUint16(8) !== 0x002A) {
        return null;
      }
      if (exif.getUint16(6) === 0x4949) {
        little = true;
      } else if (exif.getUint16(6) === 0x4D4D) {
        little = false;
      } else {
        return null;
      }
      offset = 8 + exif.getUint32(10, little);
      count = exif.getUint16(offset - 2, little);
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        if (exif.byteLength < offset + 10) {
          return null;
        }
        if (exif.getUint16(offset, little) === 0x0112) {
          return exif.getUint16(offset + 8, little);
        }
        offset += 12;
      }
      return null;
    };
    return ns.hasTransparency = function(img) {
      var canvas, ctx, data, i, pcsn, _i, _ref2;
      pcsn = 50;
      canvas = document.createElement('canvas');
      canvas.width = canvas.height = pcsn;
      ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, pcsn, pcsn);
      data = ctx.getImageData(0, 0, pcsn, pcsn).data;
      canvas.width = canvas.height = 1;
      for (i = _i = 3, _ref2 = data.length; _i < _ref2; i = _i += 4) {
        if (data[i] < 254) {
          return true;
        }
      }
      return false;
    };
  });

}).call(this);
(function() {
  var $, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = uploadcare.jQuery, utils = uploadcare.utils;

  uploadcare.namespace('files', function(ns) {
    return ns.ObjectFile = (function(_super) {
      var _directRunner;

      __extends(ObjectFile, _super);

      _directRunner = null;

      ObjectFile.prototype.sourceName = 'local';

      function ObjectFile(__file) {
        this.__file = __file;
        this.setFile = __bind(this.setFile, this);
        ObjectFile.__super__.constructor.apply(this, arguments);
        this.fileName = this.__file.name || 'original';
        this.__notifyApi();
      }

      ObjectFile.prototype.setFile = function(file) {
        if (file) {
          this.__file = file;
        }
        this.sourceInfo.file = this.__file;
        if (!this.__file) {
          return;
        }
        this.fileSize = this.__file.size;
        this.fileType = this.__file.type || 'application/octet-stream';
        if (this.settings.debugUploads) {
          utils.debug("Use local file.", this.fileName, this.fileType, this.fileSize);
        }
        this.__runValidators();
        return this.__notifyApi();
      };

      ObjectFile.prototype.__startUpload = function() {
        var df, ios, resizeShare,
          _this = this;
        this.apiDeferred.always(function() {
          return _this.__file = null;
        });
        if (this.__file.size >= this.settings.multipartMinSize && utils.abilities.Blob) {
          this.setFile();
          return this.multipartUpload();
        }
        ios = utils.abilities.iOSVersion;
        if (!this.settings.imageShrink || (ios && ios < 8)) {
          this.setFile();
          return this.directUpload();
        }
        df = $.Deferred();
        resizeShare = .4;
        utils.image.shrinkFile(this.__file, this.settings.imageShrink).progress(function(progress) {
          return df.notify(progress * resizeShare);
        }).done(this.setFile).fail(function() {
          _this.setFile();
          return resizeShare = resizeShare * .1;
        }).always(function() {
          df.notify(resizeShare);
          return _this.directUpload().done(df.resolve).fail(df.reject).progress(function(progress) {
            return df.notify(resizeShare + progress * (1 - resizeShare));
          });
        });
        return df;
      };

      ObjectFile.prototype.__autoAbort = function(xhr) {
        this.apiDeferred.fail(xhr.abort);
        return xhr;
      };

      ObjectFile.prototype.directRunner = function(task) {
        if (!_directRunner) {
          _directRunner = utils.taskRunner(this.settings.parallelDirectUploads);
        }
        return _directRunner(task);
      };

      ObjectFile.prototype.directUpload = function() {
        var df,
          _this = this;
        df = $.Deferred();
        if (!this.__file) {
          this.__rejectApi('baddata');
          return df;
        }
        if (this.fileSize > 100 * 1024 * 1024) {
          this.__rejectApi('size');
          return df;
        }
        this.directRunner(function(release) {
          var formData;
          df.always(release);
          if (_this.apiDeferred.state() !== 'pending') {
            return;
          }
          formData = new FormData();
          formData.append('UPLOADCARE_PUB_KEY', _this.settings.publicKey);
          formData.append('signature', _this.settings.secureSignature);
          formData.append('expire', _this.settings.secureExpire);
          formData.append('UPLOADCARE_STORE', _this.settings.doNotStore ? '' : 'auto');
          formData.append('file', _this.__file, _this.fileName);
          formData.append('file_name', _this.fileName);
          formData.append('source', _this.sourceInfo.source);
          return _this.__autoAbort($.ajax({
            xhr: function() {
              var xhr;
              xhr = $.ajaxSettings.xhr();
              if (xhr.upload) {
                xhr.upload.addEventListener('progress', function(e) {
                  return df.notify(e.loaded / e.total);
                }, false);
              }
              return xhr;
            },
            crossDomain: true,
            type: 'POST',
            url: "" + _this.settings.urlBase + "/base/?jsonerrors=1",
            headers: {
              'X-PINGOTHER': 'pingpong'
            },
            contentType: false,
            processData: false,
            data: formData,
            dataType: 'json',
            error: df.reject,
            success: function(data) {
              if (data != null ? data.file : void 0) {
                _this.fileId = data.file;
                return df.resolve();
              } else {
                return df.reject();
              }
            }
          }));
        });
        return df;
      };

      ObjectFile.prototype.multipartUpload = function() {
        var df,
          _this = this;
        df = $.Deferred();
        if (!this.__file) {
          return df;
        }
        if (this.settings.imagesOnly) {
          this.__rejectApi('image');
          return df;
        }
        this.multipartStart().done(function(data) {
          return _this.uploadParts(data.parts, data.uuid).done(function() {
            return _this.multipartComplete(data.uuid).done(function(data) {
              _this.fileId = data.uuid;
              _this.__handleFileData(data);
              return df.resolve();
            }).fail(df.reject);
          }).progress(df.notify).fail(df.reject);
        }).fail(df.reject);
        return df;
      };

      ObjectFile.prototype.multipartStart = function() {
        var data,
          _this = this;
        data = {
          UPLOADCARE_PUB_KEY: this.settings.publicKey,
          signature: this.settings.secureSignature,
          expire: this.settings.secureExpire,
          filename: this.fileName,
          source: this.sourceInfo.source,
          size: this.fileSize,
          content_type: this.fileType,
          part_size: this.settings.multipartPartSize,
          UPLOADCARE_STORE: this.settings.doNotStore ? '' : 'auto'
        };
        return this.__autoAbort(utils.jsonp("" + this.settings.urlBase + "/multipart/start/?jsonerrors=1", 'POST', data).fail(function(reason) {
          if (_this.settings.debugUploads) {
            return utils.log("Can't start multipart upload.", reason, data);
          }
        }));
      };

      ObjectFile.prototype.uploadParts = function(parts, uuid) {
        var df, i, inProgress, lastUpdate, progress, submit, submittedBytes, submittedParts, updateProgress, _i, _ref,
          _this = this;
        progress = [];
        lastUpdate = $.now();
        updateProgress = function(i, loaded) {
          var total, _i, _len;
          progress[i] = loaded;
          if ($.now() - lastUpdate < 250) {
            return;
          }
          lastUpdate = $.now();
          total = 0;
          for (_i = 0, _len = progress.length; _i < _len; _i++) {
            loaded = progress[_i];
            total += loaded;
          }
          return df.notify(total / _this.fileSize);
        };
        df = $.Deferred();
        inProgress = 0;
        submittedParts = 0;
        submittedBytes = 0;
        submit = function() {
          var attempts, blob, bytesToSubmit, partNo, retry;
          if (submittedBytes >= _this.fileSize) {
            return;
          }
          bytesToSubmit = submittedBytes + _this.settings.multipartPartSize;
          if (_this.fileSize < bytesToSubmit + _this.settings.multipartMinLastPartSize) {
            bytesToSubmit = _this.fileSize;
          }
          blob = _this.__file.slice(submittedBytes, bytesToSubmit);
          submittedBytes = bytesToSubmit;
          partNo = submittedParts;
          inProgress += 1;
          submittedParts += 1;
          attempts = 0;
          return (retry = function() {
            if (_this.apiDeferred.state() !== 'pending') {
              return;
            }
            progress[partNo] = 0;
            return _this.__autoAbort($.ajax({
              xhr: function() {
                var xhr;
                xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                  xhr.upload.addEventListener('progress', function(e) {
                    return updateProgress(partNo, e.loaded);
                  }, false);
                }
                return xhr;
              },
              url: parts[partNo],
              crossDomain: true,
              type: 'PUT',
              processData: false,
              contentType: _this.fileType,
              data: blob,
              error: function() {
                attempts += 1;
                if (attempts > _this.settings.multipartMaxAttempts) {
                  if (_this.settings.debugUploads) {
                    utils.info("Part #" + partNo + " and file upload is failed.", uuid);
                  }
                  return df.reject();
                } else {
                  if (_this.settings.debugUploads) {
                    utils.debug("Part #" + partNo + "(" + attempts + ") upload is failed.", uuid);
                  }
                  return retry();
                }
              },
              success: function() {
                inProgress -= 1;
                submit();
                if (!inProgress) {
                  return df.resolve();
                }
              }
            }));
          })();
        };
        for (i = _i = 0, _ref = this.settings.multipartConcurrency; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          submit();
        }
        return df;
      };

      ObjectFile.prototype.multipartComplete = function(uuid) {
        var data,
          _this = this;
        data = {
          UPLOADCARE_PUB_KEY: this.settings.publicKey,
          uuid: uuid
        };
        return this.__autoAbort(utils.jsonp("" + this.settings.urlBase + "/multipart/complete/?jsonerrors=1", "POST", data).fail(function(reason) {
          if (_this.settings.debugUploads) {
            return utils.log("Can't complete multipart upload.", uuid, _this.settings.publicKey, reason);
          }
        }));
      };

      return ObjectFile;

    })(ns.BaseFile);
  });

}).call(this);
(function() {
  var $, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = uploadcare.jQuery, utils = uploadcare.utils;

  uploadcare.namespace('files', function(ns) {
    return ns.InputFile = (function(_super) {
      __extends(InputFile, _super);

      InputFile.prototype.sourceName = 'local-compat';

      function InputFile(__input) {
        this.__input = __input;
        this.__cleanUp = __bind(this.__cleanUp, this);
        InputFile.__super__.constructor.apply(this, arguments);
        this.fileId = utils.uuid();
        this.fileName = $(this.__input).val().split('\\').pop();
        this.__notifyApi();
      }

      InputFile.prototype.__startUpload = function() {
        var df, formParam, iframeId, targetUrl;
        df = $.Deferred();
        targetUrl = "" + this.settings.urlBase + "/iframe/";
        iframeId = "uploadcare-iframe-" + this.fileId;
        this.__iframe = $('<iframe>').attr({
          id: iframeId,
          name: iframeId
        }).css('display', 'none').appendTo('body').on('load', df.resolve).on('error', df.reject);
        formParam = function(name, value) {
          return $('<input/>', {
            type: 'hidden',
            name: name,
            value: value
          });
        };
        $(this.__input).attr('name', 'file');
        this.__iframeForm = $('<form>').attr({
          method: 'POST',
          action: targetUrl,
          enctype: 'multipart/form-data',
          target: iframeId
        }).append(formParam('UPLOADCARE_PUB_KEY', this.settings.publicKey)).append(formParam('UPLOADCARE_SIGNATURE', this.settings.secureSignature)).append(formParam('UPLOADCARE_EXPIRE', this.settings.secureExpire)).append(formParam('UPLOADCARE_FILE_ID', this.fileId)).append(formParam('UPLOADCARE_STORE', this.settings.doNotStore ? '' : 'auto')).append(formParam('UPLOADCARE_SOURCE', this.sourceInfo.source)).append(this.__input).css('display', 'none').appendTo('body').submit();
        return df.always(this.__cleanUp);
      };

      InputFile.prototype.__cleanUp = function() {
        var _ref, _ref1;
        if ((_ref = this.__iframe) != null) {
          _ref.off('load error').remove();
        }
        if ((_ref1 = this.__iframeForm) != null) {
          _ref1.remove();
        }
        this.__iframe = null;
        return this.__iframeForm = null;
      };

      return InputFile;

    })(ns.BaseFile);
  });

}).call(this);
// changed:
//   Pusher.dependency_suffix = '.min'; (was '')
//   window.WEB_SOCKET_SWF_LOCATION = "https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf"

/*!
 * Pusher JavaScript Library v1.12.2
 * http://pusherapp.com/
 *
 * Copyright 2011, Pusher
 * Released under the MIT licence.
 */


;(function() {
  var Pusher, _require;

;(function() {
  if (Function.prototype.scopedTo === undefined) {
    Function.prototype.scopedTo = function(context, args) {
      var f = this;
      return function() {
        return f.apply(context, Array.prototype.slice.call(args || [])
                       .concat(Array.prototype.slice.call(arguments)));
      };
    };
  }

  Pusher = function(app_key, options) {
    this.options = options || {};
    this.key = app_key;
    this.channels = new Pusher.Channels();
    this.global_emitter = new Pusher.EventsDispatcher()

    var self = this;

    this.checkAppKey();

    this.connection = new Pusher.Connection(this.key, this.options);

    // Setup / teardown connection
    this.connection
      .bind('connected', function() {
        self.subscribeAll();
      })
      .bind('message', function(params) {
        var internal = (params.event.indexOf('pusher_internal:') === 0);
        if (params.channel) {
          var channel;
          if (channel = self.channel(params.channel)) {
            channel.emit(params.event, params.data);
          }
        }
        // Emit globaly [deprecated]
        if (!internal) self.global_emitter.emit(params.event, params.data);
      })
      .bind('disconnected', function() {
        self.channels.disconnect();
      })
      .bind('error', function(err) {
        Pusher.warn('Error', err);
      });

    Pusher.instances.push(this);

    if (Pusher.isReady) self.connect();
  };
  Pusher.instances = [];
  Pusher.prototype = {
    channel: function(name) {
      return this.channels.find(name);
    },

    connect: function() {
      this.connection.connect();
    },

    disconnect: function() {
      this.connection.disconnect();
    },

    bind: function(event_name, callback) {
      this.global_emitter.bind(event_name, callback);
      return this;
    },

    bind_all: function(callback) {
      this.global_emitter.bind_all(callback);
      return this;
    },

    subscribeAll: function() {
      var channel;
      for (channelName in this.channels.channels) {
        if (this.channels.channels.hasOwnProperty(channelName)) {
          this.subscribe(channelName);
        }
      }
    },

    subscribe: function(channel_name) {
      var self = this;
      var channel = this.channels.add(channel_name, this);

      if (this.connection.state === 'connected') {
        channel.authorize(this.connection.socket_id, this.options, function(err, data) {
          if (err) {
            channel.emit('pusher:subscription_error', data);
          } else {
            self.send_event('pusher:subscribe', {
              channel: channel_name,
              auth: data.auth,
              channel_data: data.channel_data
            });
          }
        });
      }
      return channel;
    },

    unsubscribe: function(channel_name) {
      this.channels.remove(channel_name);
      if (this.connection.state === 'connected') {
        this.send_event('pusher:unsubscribe', {
          channel: channel_name
        });
      }
    },

    send_event: function(event_name, data, channel) {
      return this.connection.send_event(event_name, data, channel);
    },

    checkAppKey: function() {
      if(this.key === null || this.key === undefined) {
        Pusher.warn('Warning', 'You must pass your app key when you instantiate Pusher.');
      }
    }
  };

  Pusher.Util = {
    extend: function extend(target, extensions) {
      for (var property in extensions) {
        if (extensions[property] && extensions[property].constructor &&
            extensions[property].constructor === Object) {
          target[property] = extend(target[property] || {}, extensions[property]);
        } else {
          target[property] = extensions[property];
        }
      }
      return target;
    },

    stringify: function stringify() {
      var m = ["Pusher"]
      for (var i = 0; i < arguments.length; i++){
        if (typeof arguments[i] === "string") {
          m.push(arguments[i])
        } else {
          if (window['JSON'] == undefined) {
            m.push(arguments[i].toString());
          } else {
            m.push(JSON.stringify(arguments[i]))
          }
        }
      };
      return m.join(" : ")
    },

    arrayIndexOf: function(array, item) { // MSIE doesn't have array.indexOf
      var nativeIndexOf = Array.prototype.indexOf;
      if (array == null) return -1;
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
      return -1;
    }
  };

  // To receive log output provide a Pusher.log function, for example
  // Pusher.log = function(m){console.log(m)}
  Pusher.debug = function() {
    if (!Pusher.log) return
    Pusher.log(Pusher.Util.stringify.apply(this, arguments))
  }
  Pusher.warn = function() {
    if (window.console && window.console.warn) {
      window.console.warn(Pusher.Util.stringify.apply(this, arguments));
    } else {
      if (!Pusher.log) return
      Pusher.log(Pusher.Util.stringify.apply(this, arguments));
    }
  };

  // Pusher defaults
  Pusher.VERSION = '1.12.2';

  Pusher.host = 'ws.pusherapp.com';
  Pusher.ws_port = 80;
  Pusher.wss_port = 443;
  Pusher.channel_auth_endpoint = '/pusher/auth';
  Pusher.cdn_http = 'http://js.pusher.com/'
  Pusher.cdn_https = 'https://d3dy5gmtp8yhk7.cloudfront.net/'
  Pusher.dependency_suffix = '.min';
  Pusher.channel_auth_transport = 'ajax';
  Pusher.activity_timeout = 120000;
  Pusher.pong_timeout = 30000;

  Pusher.isReady = false;
  Pusher.ready = function() {
    Pusher.isReady = true;
    for (var i = 0, l = Pusher.instances.length; i < l; i++) {
      Pusher.instances[i].connect();
    }
  };

})();

;(function() {
/* Abstract event binding
Example:

    var MyEventEmitter = function(){};
    MyEventEmitter.prototype = new Pusher.EventsDispatcher;

    var emitter = new MyEventEmitter();

    // Bind to single event
    emitter.bind('foo_event', function(data){ alert(data)} );

    // Bind to all
    emitter.bind_all(function(eventName, data){ alert(data) });

--------------------------------------------------------*/

  function CallbackRegistry() {
    this._callbacks = {};
  };

  CallbackRegistry.prototype.get = function(eventName) {
    return this._callbacks[this._prefix(eventName)];
  };

  CallbackRegistry.prototype.add = function(eventName, callback) {
    var prefixedEventName = this._prefix(eventName);
    this._callbacks[prefixedEventName] = this._callbacks[prefixedEventName] || [];
    this._callbacks[prefixedEventName].push(callback);
  };

  CallbackRegistry.prototype.remove = function(eventName, callback) {
    if(this.get(eventName)) {
      var index = Pusher.Util.arrayIndexOf(this.get(eventName), callback);
      this._callbacks[this._prefix(eventName)].splice(index, 1);
    }
  };

  CallbackRegistry.prototype._prefix = function(eventName) {
    return "_" + eventName;
  };


  function EventsDispatcher(failThrough) {
    this.callbacks = new CallbackRegistry();
    this.global_callbacks = [];
    // Run this function when dispatching an event when no callbacks defined
    this.failThrough = failThrough;
  }

  EventsDispatcher.prototype.bind = function(eventName, callback) {
    this.callbacks.add(eventName, callback);
    return this;// chainable
  };

  EventsDispatcher.prototype.unbind = function(eventName, callback) {
    this.callbacks.remove(eventName, callback);
    return this;
  };

  EventsDispatcher.prototype.emit = function(eventName, data) {
    // Global callbacks
    for (var i = 0; i < this.global_callbacks.length; i++) {
      this.global_callbacks[i](eventName, data);
    }

    // Event callbacks
    var callbacks = this.callbacks.get(eventName);
    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](data);
      }
    } else if (this.failThrough) {
      this.failThrough(eventName, data)
    }

    return this;
  };

  EventsDispatcher.prototype.bind_all = function(callback) {
    this.global_callbacks.push(callback);
    return this;
  };

  Pusher.EventsDispatcher = EventsDispatcher;
})();

;(function() {
  /*-----------------------------------------------
    Helpers:
  -----------------------------------------------*/

  function capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }


  function safeCall(method, obj, data) {
    if (obj[method] !== undefined) {
      obj[method](data);
    }
  }

  /*-----------------------------------------------
    The State Machine
  -----------------------------------------------*/
  function Machine(initialState, transitions, stateActions) {
    Pusher.EventsDispatcher.call(this);

    this.state = undefined;
    this.errors = [];

    // functions for each state
    this.stateActions = stateActions;

    // set up the transitions
    this.transitions = transitions;

    this.transition(initialState);
  };

  Machine.prototype.transition = function(nextState, data) {
    var prevState = this.state;
    var stateCallbacks = this.stateActions;

    if (prevState && (Pusher.Util.arrayIndexOf(this.transitions[prevState], nextState) == -1)) {
      this.emit('invalid_transition_attempt', {
        oldState: prevState,
        newState: nextState
      });

      throw new Error('Invalid transition [' + prevState + ' to ' + nextState + ']');
    }

    // exit
    safeCall(prevState + 'Exit', stateCallbacks, data);

    // tween
    safeCall(prevState + 'To' + capitalize(nextState), stateCallbacks, data);

    // pre
    safeCall(nextState + 'Pre', stateCallbacks, data);

    // change state:
    this.state = nextState;

    // handy to bind to
    this.emit('state_change', {
      oldState: prevState,
      newState: nextState
    });

    // Post:
    safeCall(nextState + 'Post', stateCallbacks, data);
  };

  Machine.prototype.is = function(state) {
    return this.state === state;
  };

  Machine.prototype.isNot = function(state) {
    return this.state !== state;
  };

  Pusher.Util.extend(Machine.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.Machine = Machine;
})();

;(function() {
  /*
    A little bauble to interface with window.navigator.onLine,
    window.ononline and window.onoffline.  Easier to mock.
  */

  var NetInfo = function() {
    var self = this;
    Pusher.EventsDispatcher.call(this);
    // This is okay, as IE doesn't support this stuff anyway.
    if (window.addEventListener !== undefined) {
      window.addEventListener("online", function() {
        self.emit('online', null);
      }, false);
      window.addEventListener("offline", function() {
        self.emit('offline', null);
      }, false);
    }
  };

  // Offline means definitely offline (no connection to router).
  // Inverse does NOT mean definitely online (only currently supported in Safari
  // and even there only means the device has a connection to the router).
  NetInfo.prototype.isOnLine = function() {
    if (window.navigator.onLine === undefined) {
      return true;
    } else {
      return window.navigator.onLine;
    }
  };

  Pusher.Util.extend(NetInfo.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.NetInfo = NetInfo;
})();

;(function() {
  var machineTransitions = {
    'initialized': ['waiting', 'failed'],
    'waiting': ['connecting', 'permanentlyClosed'],
    'connecting': ['open', 'permanentlyClosing', 'impermanentlyClosing', 'waiting'],
    'open': ['connected', 'permanentlyClosing', 'impermanentlyClosing', 'waiting'],
    'connected': ['permanentlyClosing', 'waiting'],
    'impermanentlyClosing': ['waiting', 'permanentlyClosing'],
    'permanentlyClosing': ['permanentlyClosed'],
    'permanentlyClosed': ['waiting', 'failed'],
    'failed': ['permanentlyClosed']
  };


  // Amount to add to time between connection attemtpts per failed attempt.
  var UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT = 2000;
  var UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT = 2000;
  var UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT = 2000;

  var MAX_CONNECTION_ATTEMPT_WAIT = 5 * UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT;
  var MAX_OPEN_ATTEMPT_TIMEOUT = 5 * UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT;
  var MAX_CONNECTED_ATTEMPT_TIMEOUT = 5 * UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT;

  function resetConnectionParameters(connection) {
    connection.connectionWait = 0;

    if (Pusher.TransportType === 'flash') {
      // Flash needs a bit more time
      connection.openTimeout = 5000;
    } else {
      connection.openTimeout = 2000;
    }
    connection.connectedTimeout = 2000;
    connection.connectionSecure = connection.compulsorySecure;
    connection.connectionAttempts = 0;
  }

  function Connection(key, options) {
    var self = this;

    Pusher.EventsDispatcher.call(this);

    this.options = Pusher.Util.extend({encrypted: false}, options);

    this.netInfo = new Pusher.NetInfo();

    this.netInfo.bind('online', function(){
      if (self._machine.is('waiting')) {
        self._machine.transition('connecting');
        updateState('connecting');
      }
    });

    this.netInfo.bind('offline', function() {
      if (self._machine.is('connected')) {
        // These are for Chrome 15, which ends up
        // having two sockets hanging around.
        self.socket.onclose = undefined;
        self.socket.onmessage = undefined;
        self.socket.onerror = undefined;
        self.socket.onopen = undefined;

        self.socket.close();
        self.socket = undefined;
        self._machine.transition('waiting');
      }
    });

    // define the state machine that runs the connection
    this._machine = new Pusher.Machine('initialized', machineTransitions, {
      initializedPre: function() {
        self.compulsorySecure = self.options.encrypted;

        self.key = key;
        self.socket = null;
        self.socket_id = null;

        self.state = 'initialized';
      },

      waitingPre: function() {
        if (self.connectionWait > 0) {
          self.emit('connecting_in', self.connectionWait);
        }

        if (self.netInfo.isOnLine() && self.connectionAttempts <= 4) {
          updateState('connecting');
        } else {
          updateState('unavailable');
        }

        // When in the unavailable state we attempt to connect, but don't
        // broadcast that fact
        if (self.netInfo.isOnLine()) {
          self._waitingTimer = setTimeout(function() {
            self._machine.transition('connecting');
          }, connectionDelay());
        }
      },

      waitingExit: function() {
        clearTimeout(self._waitingTimer);
      },

      connectingPre: function() {
        // Case that a user manages to get to the connecting
        // state even when offline.
        if (self.netInfo.isOnLine() === false) {
          self._machine.transition('waiting');
          updateState('unavailable');

          return;
        }

        var url = formatURL(self.key, self.connectionSecure);
        Pusher.debug('Connecting', url);
        self.socket = new Pusher.Transport(url);
        // now that the socket connection attempt has been started,
        // set up the callbacks fired by the socket for different outcomes
        self.socket.onopen = ws_onopen;
        self.socket.onclose = transitionToWaiting;
        self.socket.onerror = ws_onError;

        // allow time to get ws_onOpen, otherwise close socket and try again
        self._connectingTimer = setTimeout(TransitionToImpermanentlyClosing, self.openTimeout);
      },

      connectingExit: function() {
        clearTimeout(self._connectingTimer);
        self.socket.onopen = undefined; // unbind to avoid open events that are no longer relevant
      },

      connectingToWaiting: function() {
        updateConnectionParameters();

        // FUTURE: update only ssl
      },

      connectingToImpermanentlyClosing: function() {
        updateConnectionParameters();

        // FUTURE: update only timeout
      },

      openPre: function() {
        self.socket.onmessage = ws_onMessageOpen;
        self.socket.onerror = ws_onError;
        self.socket.onclose = transitionToWaiting;

        // allow time to get connected-to-Pusher message, otherwise close socket, try again
        self._openTimer = setTimeout(TransitionToImpermanentlyClosing, self.connectedTimeout);
      },

      openExit: function() {
        clearTimeout(self._openTimer);
        self.socket.onmessage = undefined; // unbind to avoid messages that are no longer relevant
      },

      openToWaiting: function() {
        updateConnectionParameters();
      },

      openToImpermanentlyClosing: function() {
        updateConnectionParameters();
      },

      connectedPre: function(socket_id) {
        self.socket_id = socket_id;

        self.socket.onmessage = ws_onMessageConnected;
        self.socket.onerror = ws_onError;
        self.socket.onclose = transitionToWaiting;

        resetConnectionParameters(self);
        self.connectedAt = new Date().getTime();

        resetActivityCheck();
      },

      connectedPost: function() {
        updateState('connected');
      },

      connectedExit: function() {
        stopActivityCheck();
        updateState('disconnected');
      },

      impermanentlyClosingPost: function() {
        if (self.socket) {
          self.socket.onclose = transitionToWaiting;
          self.socket.close();
        }
      },

      permanentlyClosingPost: function() {
        if (self.socket) {
          self.socket.onclose = function() {
            resetConnectionParameters(self);
            self._machine.transition('permanentlyClosed');
          };

          self.socket.close();
        } else {
          resetConnectionParameters(self);
          self._machine.transition('permanentlyClosed');
        }
      },

      failedPre: function() {
        updateState('failed');
        Pusher.debug('WebSockets are not available in this browser.');
      },

      permanentlyClosedPost: function() {
        updateState('disconnected');
      }
    });

    /*-----------------------------------------------
      -----------------------------------------------*/

    function updateConnectionParameters() {
      if (self.connectionWait < MAX_CONNECTION_ATTEMPT_WAIT) {
        self.connectionWait += UNSUCCESSFUL_CONNECTION_ATTEMPT_ADDITIONAL_WAIT;
      }

      if (self.openTimeout < MAX_OPEN_ATTEMPT_TIMEOUT) {
        self.openTimeout += UNSUCCESSFUL_OPEN_ATTEMPT_ADDITIONAL_TIMEOUT;
      }

      if (self.connectedTimeout < MAX_CONNECTED_ATTEMPT_TIMEOUT) {
        self.connectedTimeout += UNSUCCESSFUL_CONNECTED_ATTEMPT_ADDITIONAL_TIMEOUT;
      }

      if (self.compulsorySecure !== true) {
        self.connectionSecure = !self.connectionSecure;
      }

      self.connectionAttempts++;
    }

    function formatURL(key, isSecure) {
      var port = Pusher.ws_port;
      var protocol = 'ws://';

      // Always connect with SSL if the current page has
      // been loaded via HTTPS.
      //
      // FUTURE: Always connect using SSL.
      //
      if (isSecure || document.location.protocol === 'https:') {
        port = Pusher.wss_port;
        protocol = 'wss://';
      }

      var flash = (Pusher.TransportType === "flash") ? "true" : "false";

      return protocol + Pusher.host + ':' + port + '/app/' + key + '?protocol=5&client=js'
        + '&version=' + Pusher.VERSION
        + '&flash=' + flash;
    }

    // callback for close and retry.  Used on timeouts.
    function TransitionToImpermanentlyClosing() {
      self._machine.transition('impermanentlyClosing');
    }

    function resetActivityCheck() {
      if (self._activityTimer) { clearTimeout(self._activityTimer); }
      // Send ping after inactivity
      self._activityTimer = setTimeout(function() {
        self.send_event('pusher:ping', {})
        // Wait for pong response
        self._activityTimer = setTimeout(function() {
          self.socket.close();
        }, (self.options.pong_timeout || Pusher.pong_timeout))
      }, (self.options.activity_timeout || Pusher.activity_timeout))
    }

    function stopActivityCheck() {
      if (self._activityTimer) { clearTimeout(self._activityTimer); }
    }

    // Returns the delay before the next connection attempt should be made
    //
    // This function guards against attempting to connect more frequently than
    // once every second
    //
    function connectionDelay() {
      var delay = self.connectionWait;
      if (delay === 0) {
        if (self.connectedAt) {
          var t = 1000;
          var connectedFor = new Date().getTime() - self.connectedAt;
          if (connectedFor < t) {
            delay = t - connectedFor;
          }
        }
      }
      return delay;
    }

    /*-----------------------------------------------
      WebSocket Callbacks
      -----------------------------------------------*/

    // no-op, as we only care when we get pusher:connection_established
    function ws_onopen() {
      self._machine.transition('open');
    };

    function handleCloseCode(code, message) {
      // first inform the end-developer of this error
      self.emit('error', {type: 'PusherError', data: {code: code, message: message}});

      if (code === 4000) {
        // SSL only app
        self.compulsorySecure = true;
        self.connectionSecure = true;
        self.options.encrypted = true;

        TransitionToImpermanentlyClosing();
      } else if (code < 4100) {
        // Permentently close connection
        self._machine.transition('permanentlyClosing')
      } else if (code < 4200) {
        // Backoff before reconnecting
        self.connectionWait = 1000;
        self._machine.transition('waiting')
      } else if (code < 4300) {
        // Reconnect immediately
        TransitionToImpermanentlyClosing();
      } else {
        // Unknown error
        self._machine.transition('permanentlyClosing')
      }
    }

    function ws_onMessageOpen(event) {
      var params = parseWebSocketEvent(event);
      if (params !== undefined) {
        if (params.event === 'pusher:connection_established') {
          self._machine.transition('connected', params.data.socket_id);
        } else if (params.event === 'pusher:error') {
          handleCloseCode(params.data.code, params.data.message)
        }
      }
    }

    function ws_onMessageConnected(event) {
      resetActivityCheck();

      var params = parseWebSocketEvent(event);
      if (params !== undefined) {
        Pusher.debug('Event recd', params);

        switch (params.event) {
          case 'pusher:error':
            self.emit('error', {type: 'PusherError', data: params.data});
            break;
          case 'pusher:ping':
            self.send_event('pusher:pong', {})
            break;
        }

        self.emit('message', params);
      }
    }


    /**
     * Parses an event from the WebSocket to get
     * the JSON payload that we require
     *
     * @param {MessageEvent} event  The event from the WebSocket.onmessage handler.
    **/
    function parseWebSocketEvent(event) {
      try {
        var params = JSON.parse(event.data);

        if (typeof params.data === 'string') {
          try {
            params.data = JSON.parse(params.data);
          } catch (e) {
            if (!(e instanceof SyntaxError)) {
              throw e;
            }
          }
        }

        return params;
      } catch (e) {
        self.emit('error', {type: 'MessageParseError', error: e, data: event.data});
      }
    }

    function transitionToWaiting() {
      self._machine.transition('waiting');
    }

    function ws_onError(error) {
      // just emit error to user - socket will already be closed by browser
      self.emit('error', { type: 'WebSocketError', error: error });
    }

    // Updates the public state information exposed by connection
    //
    // This is distinct from the internal state information used by _machine
    // to manage the connection
    //
    function updateState(newState, data) {
      var prevState = self.state;
      self.state = newState;

      // Only emit when the state changes
      if (prevState !== newState) {
        Pusher.debug('State changed', prevState + ' -> ' + newState);
        self.emit('state_change', {previous: prevState, current: newState});
        self.emit(newState, data);
      }
    }
  };

  Connection.prototype.connect = function() {
    // no WebSockets
    if (!this._machine.is('failed') && !Pusher.Transport) {
      this._machine.transition('failed');
    }
    // initial open of connection
    else if(this._machine.is('initialized')) {
      resetConnectionParameters(this);
      this._machine.transition('waiting');
    }
    // user skipping connection wait
    else if (this._machine.is('waiting') && this.netInfo.isOnLine() === true) {
      this._machine.transition('connecting');
    }
    // user re-opening connection after closing it
    else if(this._machine.is("permanentlyClosed")) {
      resetConnectionParameters(this);
      this._machine.transition('waiting');
    }
  };

  Connection.prototype.send = function(data) {
    if (this._machine.is('connected')) {
      // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
      var self = this;
      setTimeout(function() {
        self.socket.send(data);
      }, 0);
      return true;
    } else {
      return false;
    }
  };

  Connection.prototype.send_event = function(event_name, data, channel) {
    var payload = {
      event: event_name,
      data: data
    };
    if (channel) payload['channel'] = channel;

    Pusher.debug('Event sent', payload);
    return this.send(JSON.stringify(payload));
  }

  Connection.prototype.disconnect = function() {
    if (this._machine.is('permanentlyClosed')) return;

    if (this._machine.is('waiting') || this._machine.is('failed')) {
      this._machine.transition('permanentlyClosed');
    } else {
      this._machine.transition('permanentlyClosing');
    }
  };

  Pusher.Util.extend(Connection.prototype, Pusher.EventsDispatcher.prototype);
  Pusher.Connection = Connection;
})();

;(function() {
  Pusher.Channels = function() {
    this.channels = {};
  };

  Pusher.Channels.prototype = {
    add: function(channel_name, pusher) {
      var existing_channel = this.find(channel_name);
      if (!existing_channel) {
        var channel = Pusher.Channel.factory(channel_name, pusher);
        this.channels[channel_name] = channel;
        return channel;
      } else {
        return existing_channel;
      }
    },

    find: function(channel_name) {
      return this.channels[channel_name];
    },

    remove: function(channel_name) {
      delete this.channels[channel_name];
    },

    disconnect: function () {
      for(var channel_name in this.channels){
        this.channels[channel_name].disconnect()
      }
    }
  };

  Pusher.Channel = function(channel_name, pusher) {
    var self = this;
    Pusher.EventsDispatcher.call(this, function(event_name, event_data) {
      Pusher.debug('No callbacks on ' + channel_name + ' for ' + event_name);
    });

    this.pusher = pusher;
    this.name = channel_name;
    this.subscribed = false;

    this.bind('pusher_internal:subscription_succeeded', function(data) {
      self.onSubscriptionSucceeded(data);
    });
  };

  Pusher.Channel.prototype = {
    // inheritable constructor
    init: function() {},
    disconnect: function() {
      this.subscribed = false;
      this.emit("pusher_internal:disconnected");
    },

    onSubscriptionSucceeded: function(data) {
      this.subscribed = true;
      this.emit('pusher:subscription_succeeded');
    },

    authorize: function(socketId, options, callback){
      return callback(false, {}); // normal channels don't require auth
    },

    trigger: function(event, data) {
      return this.pusher.send_event(event, data, this.name);
    }
  };

  Pusher.Util.extend(Pusher.Channel.prototype, Pusher.EventsDispatcher.prototype);

  Pusher.Channel.PrivateChannel = {
    authorize: function(socketId, options, callback){
      var self = this;
      var authorizer = new Pusher.Channel.Authorizer(this, Pusher.channel_auth_transport, options);
      return authorizer.authorize(socketId, function(err, authData) {
        if(!err) {
          self.emit('pusher_internal:authorized', authData);
        }

        callback(err, authData);
      });
    }
  };

  Pusher.Channel.PresenceChannel = {
    init: function(){
      this.members = new Members(this); // leeches off channel events
    },

    onSubscriptionSucceeded: function(data) {
      this.subscribed = true;
      // We override this because we want the Members obj to be responsible for
      // emitting the pusher:subscription_succeeded.  It will do this after it has done its work.
    }
  };

  var Members = function(channel) {
    var self = this;

    var reset = function() {
      this._members_map = {};
      this.count = 0;
      this.me = null;
    };
    reset.call(this);

    channel.bind('pusher_internal:authorized', function(authorizedData) {
      var channelData = JSON.parse(authorizedData.channel_data);
      channel.bind("pusher_internal:subscription_succeeded", function(subscriptionData) {
        self._members_map = subscriptionData.presence.hash;
        self.count = subscriptionData.presence.count;
        self.me = self.get(channelData.user_id);
        channel.emit('pusher:subscription_succeeded', self);
      });
    });

    channel.bind('pusher_internal:member_added', function(data) {
      if(self.get(data.user_id) === null) { // only incr if user_id does not already exist
        self.count++;
      }

      self._members_map[data.user_id] = data.user_info;
      channel.emit('pusher:member_added', self.get(data.user_id));
    });

    channel.bind('pusher_internal:member_removed', function(data) {
      var member = self.get(data.user_id);
      if(member) {
        delete self._members_map[data.user_id];
        self.count--;
        channel.emit('pusher:member_removed', member);
      }
    });

    channel.bind('pusher_internal:disconnected', function() {
      reset.call(self);
    });
  };

  Members.prototype = {
    each: function(callback) {
      for(var i in this._members_map) {
        callback(this.get(i));
      }
    },

    get: function(user_id) {
      if (this._members_map.hasOwnProperty(user_id)) { // have heard of this user user_id
        return {
          id: user_id,
          info: this._members_map[user_id]
        }
      } else { // have never heard of this user
        return null;
      }
    }
  };

  Pusher.Channel.factory = function(channel_name, pusher){
    var channel = new Pusher.Channel(channel_name, pusher);
    if (channel_name.indexOf('private-') === 0) {
      Pusher.Util.extend(channel, Pusher.Channel.PrivateChannel);
    } else if (channel_name.indexOf('presence-') === 0) {
      Pusher.Util.extend(channel, Pusher.Channel.PrivateChannel);
      Pusher.Util.extend(channel, Pusher.Channel.PresenceChannel);
    };
    channel.init();
    return channel;
  };
})();

;(function() {
  Pusher.Channel.Authorizer = function(channel, type, options) {
    this.channel = channel;
    this.type = type;

    this.authOptions = (options || {}).auth || {};
  };

  Pusher.Channel.Authorizer.prototype = {
    composeQuery: function(socketId) {
      var query = '&socket_id=' + encodeURIComponent(socketId)
        + '&channel_name=' + encodeURIComponent(this.channel.name);

      for(var i in this.authOptions.params) {
        query += "&" + encodeURIComponent(i) + "=" + encodeURIComponent(this.authOptions.params[i]);
      }

      return query;
    },

    authorize: function(socketId, callback) {
      return Pusher.authorizers[this.type].call(this, socketId, callback);
    }
  };


  Pusher.auth_callbacks = {};
  Pusher.authorizers = {
    ajax: function(socketId, callback){
      var self = this, xhr;

      if (Pusher.XHR) {
        xhr = new Pusher.XHR();
      } else {
        xhr = (window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
      }

      xhr.open("POST", Pusher.channel_auth_endpoint, true);

      // add request headers
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
      for(var headerName in this.authOptions.headers) {
        xhr.setRequestHeader(headerName, this.authOptions.headers[headerName]);
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            var data, parsed = false;

            try {
              data = JSON.parse(xhr.responseText);
              parsed = true;
            } catch (e) {
              callback(true, 'JSON returned from webapp was invalid, yet status code was 200. Data was: ' + xhr.responseText);
            }

            if (parsed) { // prevents double execution.
              callback(false, data);
            }
          } else {
            Pusher.warn("Couldn't get auth info from your webapp", xhr.status);
            callback(true, xhr.status);
          }
        }
      };

      xhr.send(this.composeQuery(socketId));
      return xhr;
    },

    jsonp: function(socketId, callback){
      if(this.authOptions.headers !== undefined) {
        Pusher.warn("Warn", "To send headers with the auth request, you must use AJAX, rather than JSONP.");
      }

      var script = document.createElement("script");
      // Hacked wrapper.
      Pusher.auth_callbacks[this.channel.name] = function(data) {
        callback(false, data);
      };

      var callback_name = "Pusher.auth_callbacks['" + this.channel.name + "']";
      script.src = Pusher.channel_auth_endpoint
        + '?callback='
        + encodeURIComponent(callback_name)
        + this.composeQuery(socketId);

      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      head.insertBefore( script, head.firstChild );
    }
  };
})();

// _require(dependencies, callback) takes an array of dependency urls and a
// callback to call when all the dependecies have finished loading
var _require = (function() {
  function handleScriptLoaded(elem, callback) {
    if (document.addEventListener) {
      elem.addEventListener('load', callback, false);
    } else {
      elem.attachEvent('onreadystatechange', function () {
        if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
          callback();
        }
      });
    }
  }

  function addScript(src, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute("type","text/javascript");
    script.setAttribute('async', true);

    handleScriptLoaded(script, function() {
      callback();
    });

    head.appendChild(script);
  }

  return function(deps, callback) {
    var deps_loaded = 0;
    for (var i = 0; i < deps.length; i++) {
      addScript(deps[i], function() {
        if (deps.length == ++deps_loaded) {
          // This setTimeout is a workaround for an Opera issue
          setTimeout(callback, 0);
        }
      });
    }
  }
})();

;(function() {
  // Support Firefox versions which prefix WebSocket
  if (!window['WebSocket'] && window['MozWebSocket']) {
    window['WebSocket'] = window['MozWebSocket']
  }

  if (window['WebSocket']) {
    Pusher.Transport = window['WebSocket'];
    Pusher.TransportType = 'native';
  }

  var cdn = (document.location.protocol == 'http:') ? Pusher.cdn_http : Pusher.cdn_https;
  var root = cdn + Pusher.VERSION;
  var deps = [];

  if (!window['JSON']) {
    deps.push(root + '/json2' + Pusher.dependency_suffix + '.js');
  }
  if (!window['WebSocket']) {
    // We manually initialize web-socket-js to iron out cross browser issues
    window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
    deps.push(root + '/flashfallback' + Pusher.dependency_suffix + '.js');
  }

  var initialize = function() {
    if (window['WebSocket']) {
      // Initialize function in the case that we have native WebSocket support
      return function() {
        Pusher.ready();
      }
    } else {
      // Initialize function for fallback case
      return function() {
        if (window['WebSocket']) {
          // window['WebSocket'] is a flash emulation of WebSocket
          Pusher.Transport = window['WebSocket'];
          Pusher.TransportType = 'flash';

          // window.WEB_SOCKET_SWF_LOCATION = root + "/WebSocketMain.swf";
          window.WEB_SOCKET_SWF_LOCATION = "https://s3.amazonaws.com/uploadcare-static/WebSocketMainInsecure.swf"
          WebSocket.__addTask(function() {
            Pusher.ready();
          })
          WebSocket.__initialize();
        } else {
          // Flash must not be installed
          Pusher.Transport = null;
          Pusher.TransportType = 'none';
          Pusher.ready();
        }
      }
    }
  }();

  // Allows calling a function when the document body is available
  var ondocumentbody = function(callback) {
    var load_body = function() {
      document.body ? callback() : setTimeout(load_body, 0);
    }
    load_body();
  };

  var initializeOnDocumentBody = function() {
    ondocumentbody(initialize);
  }

  if (deps.length > 0) {
    _require(deps, initializeOnDocumentBody);
  } else {
    initializeOnDocumentBody();
  }
})();


this.Pusher = Pusher;

}).call(uploadcare);
(function() {
  var $,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = uploadcare.jQuery;

  uploadcare.namespace('utils.pusher', function(ns) {
    var ManagedPusher, pushers, _ref;
    pushers = {};
    uploadcare.Pusher.prototype.constructor = uploadcare.Pusher;
    ManagedPusher = (function(_super) {
      __extends(ManagedPusher, _super);

      function ManagedPusher() {
        _ref = ManagedPusher.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ManagedPusher.prototype.subscribe = function(name) {
        if (this.disconnectTimeout) {
          clearTimeout(this.disconnectTimeout);
          this.disconnectTimeout = null;
        }
        this.connect();
        return ManagedPusher.__super__.subscribe.apply(this, arguments);
      };

      ManagedPusher.prototype.unsubscribe = function(name) {
        var _this = this;
        ManagedPusher.__super__.unsubscribe.apply(this, arguments);
        if ($.isEmptyObject(this.channels.channels)) {
          return this.disconnectTimeout = setTimeout(function() {
            _this.disconnectTimeout = null;
            return _this.disconnect();
          }, 5000);
        }
      };

      return ManagedPusher;

    })(uploadcare.Pusher);
    return ns.getPusher = function(key) {
      if (pushers[key] == null) {
        pushers[key] = new ManagedPusher(key);
      }
      pushers[key].connect();
      return pushers[key];
    };
  });

}).call(this);
(function() {
  var $, pusher, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = uploadcare.jQuery, utils = uploadcare.utils;

  pusher = uploadcare.utils.pusher;

  uploadcare.namespace('files', function(ns) {
    var PollWatcher, PusherWatcher;
    ns.UrlFile = (function(_super) {
      __extends(UrlFile, _super);

      UrlFile.prototype.sourceName = 'url';

      UrlFile.prototype.allEvents = 'progress success error fail';

      function UrlFile(__url) {
        var err, filename;
        this.__url = __url;
        this.__listenWatcher = __bind(this.__listenWatcher, this);
        UrlFile.__super__.constructor.apply(this, arguments);
        filename = utils.splitUrlRegex.exec(this.__url)[3].split('/').pop();
        if (filename) {
          try {
            this.fileName = decodeURIComponent(filename);
          } catch (_error) {
            err = _error;
            this.fileName = filename;
          }
        }
        this.__notifyApi();
      }

      UrlFile.prototype.setName = function(fileName) {
        this.fileName = fileName;
        this.__realFileName = fileName;
        return this.__notifyApi();
      };

      UrlFile.prototype.setIsImage = function(isImage) {
        this.isImage = isImage;
        return this.__notifyApi();
      };

      UrlFile.prototype.__startUpload = function() {
        var data, df, pollWatcher, pusherWatcher,
          _this = this;
        df = $.Deferred();
        pusherWatcher = new PusherWatcher(this.settings);
        pollWatcher = new PollWatcher(this.settings);
        data = {
          pub_key: this.settings.publicKey,
          signature: this.settings.secureSignature,
          expire: this.settings.secureExpire,
          source_url: this.__url,
          filename: this.__realFileName || '',
          source: this.sourceInfo.source,
          store: this.settings.doNotStore ? '' : 'auto',
          jsonerrors: 1
        };
        utils.defer(function() {
          if (_this.apiDeferred.state() !== 'pending') {
            return;
          }
          return utils.jsonp("" + _this.settings.urlBase + "/from_url/", data).fail(function(reason) {
            if (_this.settings.debugUploads) {
              utils.debug("Can't start upload from URL.", reason, data);
            }
            return df.reject();
          }).done(function(data) {
            var logger;
            if (_this.apiDeferred.state() !== 'pending') {
              return;
            }
            if (_this.settings.debugUploads) {
              utils.debug("Start watchers.", data.token);
              logger = setInterval(function() {
                return utils.debug("Still watching.", data.token);
              }, 5000);
              df.done(function() {
                return utils.debug("Stop watchers.", data.token);
              }).always(function() {
                return clearInterval(logger);
              });
            }
            _this.__listenWatcher(df, $([pusherWatcher, pollWatcher]));
            df.always(function() {
              $([pusherWatcher, pollWatcher]).off(_this.allEvents);
              pusherWatcher.stopWatching();
              return pollWatcher.stopWatching();
            });
            $(pusherWatcher).one(_this.allEvents, function() {
              if (!pollWatcher.interval) {
                return;
              }
              if (_this.settings.debugUploads) {
                utils.debug("Start using pusher.", data.token);
              }
              return pollWatcher.stopWatching();
            });
            pusherWatcher.watch(data.token);
            return pollWatcher.watch(data.token);
          });
        });
        return df;
      };

      UrlFile.prototype.__listenWatcher = function(df, watcher) {
        var _this = this;
        return watcher.on('progress', function(e, data) {
          _this.fileSize = data.total;
          return df.notify(data.done / data.total);
        }).on('success', function(e, data) {
          $(e.target).trigger('progress', data);
          _this.fileId = data.uuid;
          _this.__handleFileData(data);
          return df.resolve();
        }).on('error fail', df.reject);
      };

      return UrlFile;

    })(ns.BaseFile);
    PusherWatcher = (function() {
      function PusherWatcher(settings) {
        this.settings = settings;
        try {
          this.pusher = pusher.getPusher(this.settings.pusherKey);
        } catch (_error) {
          this.pusher = null;
        }
      }

      PusherWatcher.prototype.watch = function(token) {
        var channel,
          _this = this;
        this.token = token;
        if (!this.pusher) {
          return;
        }
        channel = this.pusher.subscribe("task-status-" + this.token);
        return channel.bind_all(function(ev, data) {
          return $(_this).trigger(ev, data);
        });
      };

      PusherWatcher.prototype.stopWatching = function() {
        if (!this.pusher) {
          return;
        }
        return this.pusher.unsubscribe("task-status-" + this.token);
      };

      return PusherWatcher;

    })();
    return PollWatcher = (function() {
      function PollWatcher(settings) {
        this.settings = settings;
        this.poolUrl = "" + this.settings.urlBase + "/from_url/status/";
      }

      PollWatcher.prototype.watch = function(token) {
        var bind,
          _this = this;
        this.token = token;
        return (bind = function() {
          return _this.interval = setTimeout(function() {
            return _this.__updateStatus().done(function() {
              if (_this.interval) {
                return bind();
              }
            });
          }, 333);
        })();
      };

      PollWatcher.prototype.stopWatching = function() {
        if (this.interval) {
          clearTimeout(this.interval);
        }
        return this.interval = null;
      };

      PollWatcher.prototype.__updateStatus = function() {
        var _this = this;
        return utils.jsonp(this.poolUrl, {
          token: this.token
        }).fail(function(reason) {
          return $(_this).trigger('error');
        }).done(function(data) {
          return $(_this).trigger(data.status, data);
        });
      };

      return PollWatcher;

    })();
  });

}).call(this);
(function() {
  var $, utils,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = uploadcare.jQuery, utils = uploadcare.utils;

  uploadcare.namespace('files', function(ns) {
    ns.UploadedFile = (function(_super) {
      __extends(UploadedFile, _super);

      UploadedFile.prototype.sourceName = 'uploaded';

      function UploadedFile(fileIdOrUrl) {
        var cdnUrl;
        UploadedFile.__super__.constructor.apply(this, arguments);
        cdnUrl = utils.splitCdnUrl(fileIdOrUrl);
        if (cdnUrl) {
          this.fileId = cdnUrl[1];
          if (cdnUrl[2]) {
            this.cdnUrlModifiers = cdnUrl[2];
          }
        } else {
          this.__rejectApi('baddata');
        }
      }

      return UploadedFile;

    })(ns.BaseFile);
    return ns.ReadyFile = (function(_super) {
      __extends(ReadyFile, _super);

      ReadyFile.prototype.sourceName = 'uploaded';

      function ReadyFile(data) {
        ReadyFile.__super__.constructor.apply(this, arguments);
        if (!data) {
          this.__rejectApi('deleted');
        } else {
          this.fileId = data.uuid;
          this.__handleFileData(data);
        }
      }

      return ReadyFile;

    })(ns.BaseFile);
  });

}).call(this);
(function() {
  var $, namespace, s, t, utils, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  namespace = uploadcare.namespace, $ = uploadcare.jQuery, utils = uploadcare.utils, (_ref = uploadcare.locale, t = _ref.t), s = uploadcare.settings;

  namespace('files', function(ns) {
    ns.FileGroup = (function() {
      function FileGroup(files, settings) {
        var _this = this;
        this.__uuid = null;
        this.settings = s.build(settings);
        this.__fileColl = new utils.CollectionOfPromises(files);
        this.__allFilesDf = $.when.apply($, this.files());
        this.__fileInfosDf = (function() {
          var file;
          files = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = this.files();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              file = _ref1[_i];
              _results.push(file.then(null, function(err, info) {
                return $.when(info);
              }));
            }
            return _results;
          }).call(_this);
          return $.when.apply($, files);
        })();
        this.__createGroupDf = $.Deferred();
        this.__initApiDeferred();
      }

      FileGroup.prototype.files = function() {
        return this.__fileColl.get();
      };

      FileGroup.prototype.__save = function() {
        var _this = this;
        if (!this.__saved) {
          this.__saved = true;
          return this.__allFilesDf.done(function() {
            return _this.__createGroup().done(function(groupInfo) {
              _this.__uuid = groupInfo.id;
              return _this.__buildInfo(function(info) {
                if (_this.settings.imagesOnly && !info.isImage) {
                  return _this.__createGroupDf.reject('image', info);
                } else {
                  return _this.__createGroupDf.resolve(info);
                }
              });
            }).fail(function() {
              return _this.__createGroupDf.reject('createGroup');
            });
          });
        }
      };

      FileGroup.prototype.promise = function() {
        this.__save();
        return this.__apiDf.promise();
      };

      FileGroup.prototype.__initApiDeferred = function() {
        var notify, reject, resolve,
          _this = this;
        this.__apiDf = $.Deferred();
        this.__progressState = 'uploading';
        reject = function(err) {
          return _this.__buildInfo(function(info) {
            return _this.__apiDf.reject(err, info);
          });
        };
        resolve = function(info) {
          return _this.__apiDf.resolve(info);
        };
        notify = function() {
          return _this.__apiDf.notify(_this.__progressInfo());
        };
        notify();
        this.__fileColl.onAnyProgress(notify);
        this.__allFilesDf.done(function() {
          _this.__progressState = 'uploaded';
          return notify();
        }).fail(reject);
        return this.__createGroupDf.done(function(info) {
          _this.__progressState = 'ready';
          notify();
          return resolve(info);
        }).fail(reject);
      };

      FileGroup.prototype.__progressInfo = function() {
        var progress, progressInfo, progressInfos, _i, _len;
        progress = 0;
        progressInfos = this.__fileColl.lastProgresses();
        for (_i = 0, _len = progressInfos.length; _i < _len; _i++) {
          progressInfo = progressInfos[_i];
          progress += ((progressInfo != null ? progressInfo.progress : void 0) || 0) / progressInfos.length;
        }
        return {
          state: this.__progressState,
          uploadProgress: progress,
          progress: this.__progressState === 'ready' ? 1 : progress * 0.9
        };
      };

      FileGroup.prototype.__buildInfo = function(cb) {
        var info;
        info = {
          uuid: this.__uuid,
          cdnUrl: this.__uuid ? "" + this.settings.cdnBase + "/" + this.__uuid + "/" : null,
          name: t('file', this.__fileColl.length()),
          count: this.__fileColl.length(),
          size: 0,
          isImage: true,
          isStored: true
        };
        return this.__fileInfosDf.done(function() {
          var infos, _i, _info, _len;
          infos = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          for (_i = 0, _len = infos.length; _i < _len; _i++) {
            _info = infos[_i];
            info.size += _info.size;
            if (!_info.isImage) {
              info.isImage = false;
            }
            if (!_info.isStored) {
              info.isStored = false;
            }
          }
          return cb(info);
        });
      };

      FileGroup.prototype.__createGroup = function() {
        var df,
          _this = this;
        df = $.Deferred();
        if (this.__fileColl.length()) {
          this.__fileInfosDf.done(function() {
            var info, infos;
            infos = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return utils.jsonp("" + _this.settings.urlBase + "/group/", 'POST', {
              pub_key: _this.settings.publicKey,
              files: (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = infos.length; _i < _len; _i++) {
                  info = infos[_i];
                  _results.push("/" + info.uuid + "/" + (info.cdnUrlModifiers || ''));
                }
                return _results;
              })()
            }).fail(function(reason) {
              if (_this.settings.debugUploads) {
                utils.log("Can't create group.", _this.settings.publicKey, reason);
              }
              return df.reject();
            }).done(df.resolve);
          });
        } else {
          df.reject();
        }
        return df.promise();
      };

      FileGroup.prototype.api = function() {
        if (!this.__api) {
          this.__api = utils.bindAll(this, ['promise', 'files']);
        }
        return this.__api;
      };

      return FileGroup;

    })();
    return ns.SavedFileGroup = (function(_super) {
      __extends(SavedFileGroup, _super);

      function SavedFileGroup(__data, settings) {
        var files;
        this.__data = __data;
        files = uploadcare.filesFrom('ready', this.__data.files, settings);
        SavedFileGroup.__super__.constructor.call(this, files, settings);
      }

      SavedFileGroup.prototype.__createGroup = function() {
        return utils.wrapToPromise(this.__data);
      };

      return SavedFileGroup;

    })(ns.FileGroup);
  });

  namespace('', function(ns) {
    ns.FileGroup = function(filesAndGroups, settings) {
      var file, files, item, _i, _j, _len, _len1, _ref1;
      if (filesAndGroups == null) {
        filesAndGroups = [];
      }
      files = [];
      for (_i = 0, _len = filesAndGroups.length; _i < _len; _i++) {
        item = filesAndGroups[_i];
        if (utils.isFile(item)) {
          files.push(item);
        } else if (utils.isFileGroup(item)) {
          _ref1 = item.files();
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            file = _ref1[_j];
            files.push(file);
          }
        }
      }
      return new uploadcare.files.FileGroup(files, settings).api();
    };
    return ns.loadFileGroup = function(groupIdOrUrl, settings) {
      var df, id,
        _this = this;
      settings = s.build(settings);
      df = $.Deferred();
      id = utils.groupIdRegex.exec(groupIdOrUrl);
      if (id) {
        utils.jsonp("" + settings.urlBase + "/group/info/", {
          jsonerrors: 1,
          pub_key: settings.publicKey,
          group_id: id[0]
        }).fail(function(reason) {
          if (settings.debugUploads) {
            utils.log("Can't load group info. Probably removed.", id[0], settings.publicKey, reason);
          }
          return df.reject();
        }).done(function(data) {
          var group;
          group = new uploadcare.files.SavedFileGroup(data, settings);
          return df.resolve(group.api());
        });
      } else {
        df.reject();
      }
      return df.promise();
    };
  });

  namespace('utils', function(utils) {
    utils.isFileGroup = function(obj) {
      return obj && obj.files && obj.promise;
    };
    utils.valueToGroup = function(value, settings) {
      var files, item;
      if (value) {
        if ($.isArray(value)) {
          files = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = value.length; _i < _len; _i++) {
              item = value[_i];
              _results.push(utils.valueToFile(item, settings));
            }
            return _results;
          })();
          value = uploadcare.FileGroup(files, settings);
        } else {
          if (!utils.isFileGroup(value)) {
            return uploadcare.loadFileGroup(value, settings);
          }
        }
      }
      return utils.wrapToPromise(value || null);
    };
    return utils.isFileGroupsEqual = function(group1, group2) {
      var file, files1, files2, i, _i, _len;
      if (group1 === group2) {
        return true;
      }
      if (!(utils.isFileGroup(group1) && utils.isFileGroup(group2))) {
        return false;
      }
      files1 = group1.files();
      files2 = group2.files();
      if (files1.length !== files2.length) {
        return false;
      }
      for (i = _i = 0, _len = files1.length; _i < _len; i = ++_i) {
        file = files1[i];
        if (file !== files2[i]) {
          return false;
        }
      }
      return true;
    };
  });

}).call(this);
(function() {
  var $, f, settings, utils;

  utils = uploadcare.utils, $ = uploadcare.jQuery, f = uploadcare.files, settings = uploadcare.settings;

  uploadcare.namespace('', function(ns) {
    var converters;
    ns.fileFrom = function(type, data, s) {
      return ns.filesFrom(type, [data], s)[0];
    };
    ns.filesFrom = function(type, data, s) {
      var info, param, _i, _len, _results;
      s = settings.build(s || {});
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        param = data[_i];
        info = null;
        if ($.isArray(param)) {
          info = param[1];
          param = param[0];
        }
        _results.push(new converters[type](param, s, info).promise());
      }
      return _results;
    };
    return converters = {
      object: f.ObjectFile,
      input: f.InputFile,
      url: f.UrlFile,
      uploaded: f.UploadedFile,
      ready: f.ReadyFile
    };
  });

}).call(this);
(function() {
  var $, s, utils;

  utils = uploadcare.utils, s = uploadcare.settings, $ = uploadcare.jQuery;

  uploadcare.namespace('dragdrop', function(ns) {
    ns.support = utils.abilities.fileDragAndDrop;
    ns.uploadDrop = function(el, callback, settings) {
      settings = s.build(settings);
      return ns.receiveDrop(el, function(type, data) {
        return callback(settings.multiple ? uploadcare.filesFrom(type, data, settings) : uploadcare.fileFrom(type, data[0], settings));
      });
    };
    if (!ns.support) {
      return ns.receiveDrop = function() {};
    } else {
      ns.receiveDrop = function(el, callback) {
        ns.watchDragging(el);
        return $(el).on({
          dragover: function(e) {
            e.preventDefault();
            return e.originalEvent.dataTransfer.dropEffect = 'copy';
          },
          drop: function(e) {
            var dt, uri, uris, _i, _len, _ref;
            e.preventDefault();
            dt = e.originalEvent.dataTransfer;
            if (!dt) {
              return;
            }
            if (dt.files.length) {
              return callback('object', dt.files);
            } else {
              uris = [];
              _ref = dt.getData('text/uri-list').split();
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                uri = _ref[_i];
                uri = $.trim(uri);
                if (uri && uri[0] !== '#') {
                  uris.push(uri);
                }
              }
              if (uris) {
                return callback('url', uris);
              }
            }
          }
        });
      };
      ns.watchDragging = function(el, receiver) {
        var active, changeState, delayedEnter;
        delayedEnter = false;
        active = false;
        changeState = function(newActive) {
          if (active !== newActive) {
            return $(el).toggleClass('uploadcare-dragging', active = newActive);
          }
        };
        return $(receiver || el).on({
          dragenter: function() {
            return delayedEnter = utils.defer(function() {
              delayedEnter = false;
              return changeState(true);
            });
          },
          dragleave: function() {
            if (!delayedEnter) {
              return changeState(false);
            }
          },
          'drop mouseenter': function() {
            if (delayedEnter) {
              clearTimeout(delayedEnter);
            }
            return utils.defer(function() {
              return changeState(false);
            });
          }
        });
      };
      return ns.watchDragging('body', document);
    }
  });

}).call(this);
(function() {
  var $, abilities, files, tpl, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  files = uploadcare.files, $ = uploadcare.jQuery, (_ref = uploadcare.utils, abilities = _ref.abilities), (_ref1 = uploadcare.templates, tpl = _ref1.tpl);

  uploadcare.namespace('ui.progress', function(ns) {
    ns.Circle = (function() {
      function Circle(element) {
        this.update = __bind(this.update, this);
        if (abilities.canvas) {
          this.renderer = new ns.CanvasRenderer(element);
        } else {
          this.renderer = new ns.TextRenderer(element);
        }
        this.observed = null;
      }

      Circle.prototype.listen = function(file, selector) {
        var selectorFn,
          _this = this;
        this.reset();
        selectorFn = selector != null ? function(info) {
          return info[selector];
        } : function(x) {
          return x;
        };
        this.observed = file;
        if (this.observed.state() === "resolved") {
          this.renderer.setValue(1, true);
        } else {
          this.observed.progress(function(progress) {
            if (file === _this.observed) {
              return _this.renderer.setValue(selectorFn(progress));
            }
          }).always(function(uploadedFile) {
            if (file === _this.observed) {
              return _this.renderer.setValue(1, false);
            }
          });
        }
        return this;
      };

      Circle.prototype.reset = function(filled) {
        if (filled == null) {
          filled = false;
        }
        this.observed = null;
        return this.renderer.setValue((filled ? 1 : 0), true);
      };

      Circle.prototype.update = function() {
        return this.renderer.update();
      };

      return Circle;

    })();
    ns.BaseRenderer = (function() {
      function BaseRenderer(el) {
        this.element = $(el);
        this.element.data('uploadcare-progress-renderer', this);
        this.element.addClass('uploadcare-widget-circle');
      }

      BaseRenderer.prototype.update = function() {};

      return BaseRenderer;

    })();
    ns.TextRenderer = (function(_super) {
      __extends(TextRenderer, _super);

      function TextRenderer() {
        TextRenderer.__super__.constructor.apply(this, arguments);
        this.element.addClass('uploadcare-widget-circle--text');
        this.element.html(tpl('circle-text'));
        this.text = this.element.find('.uploadcare-widget-circle-text');
      }

      TextRenderer.prototype.setValue = function(val) {
        val = Math.round(val * 100);
        return this.text.html("" + val + " %");
      };

      return TextRenderer;

    })(ns.BaseRenderer);
    return ns.CanvasRenderer = (function(_super) {
      __extends(CanvasRenderer, _super);

      function CanvasRenderer() {
        CanvasRenderer.__super__.constructor.apply(this, arguments);
        this.canvasEl = $('<canvas>').get(0);
        this.element.addClass('uploadcare-widget-circle--canvas');
        this.element.html(this.canvasEl);
        this.setValue(0, true);
      }

      CanvasRenderer.prototype.update = function() {
        var arc, ctx, half, size;
        half = Math.floor(Math.min(this.element.width(), this.element.height()));
        size = half * 2;
        if (half) {
          if (this.canvasEl.width !== size || this.canvasEl.height !== size) {
            this.canvasEl.width = size;
            this.canvasEl.height = size;
          }
          ctx = this.canvasEl.getContext('2d');
          arc = function(radius, val) {
            var offset;
            offset = -Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(half, half);
            ctx.arc(half, half, radius, offset, offset + 2 * Math.PI * val, false);
            return ctx.fill();
          };
          ctx.clearRect(0, 0, size, size);
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = this.element.css('border-left-color');
          arc(half - .5, 1);
          ctx.fillStyle = this.element.css('color');
          arc(half, this.val);
          ctx.globalCompositeOperation = 'destination-out';
          return arc(half / 7, 1);
        }
      };

      CanvasRenderer.prototype.__animateValue = function(target) {
        var speed, start, val,
          _this = this;
        val = this.val;
        start = new Date();
        speed = target > val ? 2 : -2;
        return this.__animIntervalId = setInterval(function() {
          var current;
          current = val + (new Date() - start) / 1000 * speed;
          current = (speed > 0 ? Math.min : Math.max)(current, target);
          if (current === target) {
            _this.__stopAnimation();
          }
          return _this.__setValue(current);
        }, 15);
      };

      CanvasRenderer.prototype.__stopAnimation = function() {
        if (this.__animIntervalId) {
          clearInterval(this.__animIntervalId);
        }
        return this.__animIntervalId = null;
      };

      CanvasRenderer.prototype.__setValue = function(val) {
        this.val = val;
        return this.update();
      };

      CanvasRenderer.prototype.setValue = function(val, instant) {
        if (instant == null) {
          instant = false;
        }
        this.__stopAnimation();
        if (instant) {
          return this.__setValue(val);
        } else {
          return this.__animateValue(val);
        }
      };

      return CanvasRenderer;

    })(ns.BaseRenderer);
  });

}).call(this);
(function() {
  var $, progress, t, tpl, utils, _ref, _ref1, _ref2;

  $ = uploadcare.jQuery, utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress), (_ref1 = uploadcare.locale, t = _ref1.t), (_ref2 = uploadcare.templates, tpl = _ref2.tpl);

  uploadcare.namespace('widget', function(ns) {
    return ns.Template = (function() {
      function Template(settings, element) {
        this.settings = settings;
        this.element = element;
        this.content = $(tpl('widget'));
        this.element.after(this.content);
        this.circle = new progress.Circle(this.content.find('.uploadcare-widget-status'));
        this.statusText = this.content.find('.uploadcare-widget-text');
        this.content.toggleClass('uploadcare-widget-option-clearable', this.settings.clearable);
      }

      Template.prototype.addButton = function(name, caption) {
        if (caption == null) {
          caption = '';
        }
        return $(tpl('widget-button', {
          name: name,
          caption: caption
        })).appendTo(this.content);
      };

      Template.prototype.setStatus = function(status) {
        var prefix;
        prefix = 'uploadcare-widget-status-';
        this.content.removeClass(prefix + this.content.attr('data-status'));
        this.content.attr('data-status', status);
        this.content.addClass(prefix + status);
        return this.element.trigger("" + status + ".uploadcare");
      };

      Template.prototype.reset = function() {
        this.circle.reset();
        this.setStatus('ready');
        return this.__file = null;
      };

      Template.prototype.loaded = function() {
        this.setStatus('loaded');
        return this.circle.reset(true);
      };

      Template.prototype.listen = function(file) {
        var _this = this;
        this.__file = file;
        this.circle.listen(file, 'uploadProgress');
        this.setStatus('started');
        return file.progress(function(info) {
          if (file === _this.__file) {
            switch (info.state) {
              case 'uploading':
                return _this.statusText.text(t('uploading'));
              case 'uploaded':
                return _this.statusText.text(t('loadingInfo'));
            }
          }
        });
      };

      Template.prototype.error = function(type) {
        this.statusText.text(t("errors." + (type || 'default')));
        return this.setStatus('error');
      };

      Template.prototype.setFileInfo = function(info) {
        return this.statusText.html(tpl('widget-file-name', info)).find('.uploadcare-widget-file-name').toggleClass('needsclick', this.settings.systemDialog);
      };

      return Template;

    })();
  });

}).call(this);
(function() {
  var $, dragdrop, t, tpl, utils, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  utils = uploadcare.utils, dragdrop = uploadcare.dragdrop, (_ref = uploadcare.locale, t = _ref.t), $ = uploadcare.jQuery, (_ref1 = uploadcare.templates, tpl = _ref1.tpl);

  uploadcare.namespace('widget.tabs', function(ns) {
    return ns.FileTab = (function() {
      function FileTab(container, tabButton, dialogApi, settings, name) {
        var _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.name = name;
        this.__updateTabsList = __bind(this.__updateTabsList, this);
        this.container.append(tpl('tab-file'));
        this.container.addClass('uploadcare-dialog-padding');
        this.container.on('click', '.uploadcare-dialog-file-source', function(e) {
          return _this.dialogApi.switchTab($(e.target).data('tab'));
        });
        this.__setupFileButton();
        this.__initDragNDrop();
        this.__updateTabsList();
        this.dialogApi.onTabVisibility(this.__updateTabsList);
      }

      FileTab.prototype.__initDragNDrop = function() {
        var dropArea,
          _this = this;
        dropArea = this.container.find('.uploadcare-dialog-file-drop-area');
        if (utils.abilities.fileDragAndDrop) {
          dragdrop.receiveDrop(dropArea, function(type, data) {
            _this.dialogApi.addFiles(type, data);
            return _this.dialogApi.switchTab('preview');
          });
          return this.container.addClass("uploadcare-draganddrop");
        }
      };

      FileTab.prototype.__setupFileButton = function() {
        var fileButton,
          _this = this;
        fileButton = this.container.find('.uploadcare-dialog-big-button');
        if (utils.abilities.sendFileAPI) {
          return fileButton.on('click', function() {
            utils.fileSelectDialog(_this.container, _this.settings, function(input) {
              _this.dialogApi.addFiles('object', input.files);
              return _this.dialogApi.switchTab('preview');
            });
            return false;
          });
        } else {
          return utils.fileInput(fileButton, this.settings, function(input) {
            _this.dialogApi.addFiles('input', [input]);
            return _this.dialogApi.switchTab('preview');
          });
        }
      };

      FileTab.prototype.__updateTabsList = function() {
        var list, n, tab, _i, _len, _ref2;
        list = this.container.find('.uploadcare-dialog-file-sources').empty();
        n = 0;
        _ref2 = this.settings.tabs;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          tab = _ref2[_i];
          if (tab === this.name) {
            continue;
          }
          if (!this.dialogApi.isTabVisible(tab)) {
            continue;
          }
          n += 1;
          list.append([
            $('<div/>', {
              "class": "uploadcare-dialog-file-source",
              'data-tab': tab,
              html: t('dialog.tabs.names.' + tab)
            }), ' '
          ]);
        }
        list.toggleClass('uploadcare-hidden', n === 0);
        return this.container.find('.uploadcare-dialog-file-source-or').toggleClass('uploadcare-hidden', n === 0);
      };

      return FileTab;

    })();
  });

}).call(this);
(function() {
  var $, t, tpl, _ref;

  $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl);

  t = uploadcare.locale.t;

  uploadcare.namespace('widget.tabs', function(ns) {
    return ns.UrlTab = (function() {
      var fixUrl, urlRegexp;

      urlRegexp = /^[a-z][a-z0-9+\-.]*:?\/\//;

      fixUrl = function(url) {
        url = $.trim(url);
        if (urlRegexp.test(url)) {
          return url;
        } else {
          return 'http://' + url;
        }
      };

      function UrlTab(container, tabButton, dialogApi, settings, name) {
        var button, input,
          _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.name = name;
        this.container.append(tpl('tab-url'));
        this.container.addClass('uploadcare-dialog-padding');
        input = this.container.find('.uploadcare-dialog-input');
        input.on('change keyup input', function() {
          return button.prop('disabled', !$.trim(this.value));
        });
        button = this.container.find('.uploadcare-dialog-url-submit').prop('disabled', true);
        this.container.find('.uploadcare-dialog-url-form').on('submit', function() {
          var url;
          if (url = fixUrl(input.val())) {
            _this.dialogApi.addFiles('url', [
              [
                url, {
                  source: 'url-tab'
                }
              ]
            ]);
            input.val('');
          }
          return false;
        });
      }

      return UrlTab;

    })();
  });

}).call(this);
(function() {
  var $, tpl, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  utils = uploadcare.utils, $ = uploadcare.jQuery, (_ref = uploadcare.templates, tpl = _ref.tpl);

  uploadcare.namespace('widget.tabs', function(ns) {
    var isSecure;
    isSecure = document.location.protocol === 'https:';
    return ns.CameraTab = (function() {
      function CameraTab(container, tabButton, dialogApi, settings, name) {
        var startRecord,
          _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.name = name;
        this.__cancelRecording = __bind(this.__cancelRecording, this);
        this.__stopRecording = __bind(this.__stopRecording, this);
        this.__startRecording = __bind(this.__startRecording, this);
        this.__capture = __bind(this.__capture, this);
        this.__mirror = __bind(this.__mirror, this);
        this.__revoke = __bind(this.__revoke, this);
        this.__requestCamera = __bind(this.__requestCamera, this);
        this.__setState = __bind(this.__setState, this);
        if (!this.__checkCompatibility()) {
          this.dialogApi.hideTab(this.name);
          return;
        }
        this.__loaded = false;
        this.mirrored = true;
        this.container.append(tpl('tab-camera'));
        this.container.addClass('uploadcare-dialog-padding uploadcare-dialog-camera-requested');
        this.container.find('.uploadcare-dialog-camera-capture').on('click', this.__capture);
        startRecord = this.container.find('.uploadcare-dialog-camera-start-record').on('click', this.__startRecording);
        this.container.find('.uploadcare-dialog-camera-stop-record').on('click', this.__stopRecording);
        this.container.find('.uploadcare-dialog-camera-cancel-record').on('click', this.__cancelRecording);
        this.container.find('.uploadcare-dialog-camera-mirror').on('click', this.__mirror);
        this.container.find('.uploadcare-dialog-camera-retry').on('click', this.__requestCamera);
        if (!this.MediaRecorder || this.settings.imagesOnly) {
          startRecord.hide();
        }
        this.video = this.container.find('video');
        this.video.on('loadeddata', function() {
          return this.play();
        });
        this.dialogApi.progress(function(name) {
          if (name === _this.name) {
            if (!_this.__loaded) {
              return _this.__requestCamera();
            }
          } else {
            if (_this.__loaded && isSecure) {
              return _this.__revoke();
            }
          }
        });
        this.dialogApi.always(this.__revoke);
      }

      CameraTab.prototype.__checkCompatibility = function() {
        var isLocalhost;
        this.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        this.URL = window.URL || window.webkitURL;
        this.MediaRecorder = window.MediaRecorder;
        if (!isSecure) {
          uploadcare.utils.warn('Camera is not allowed for HTTP. Please use HTTPS connection.');
        }
        isLocalhost = document.location.hostname === 'localhost';
        return !!this.getUserMedia && Uint8Array && (isSecure || isLocalhost);
      };

      CameraTab.prototype.__setState = function(newState) {
        var oldStates;
        oldStates = ['', 'ready', 'requested', 'denied', 'not-founded', 'recording'].join(' uploadcare-dialog-camera-');
        return this.container.removeClass(oldStates).addClass("uploadcare-dialog-camera-" + newState);
      };

      CameraTab.prototype.__requestCamera = function() {
        var _this = this;
        this.__loaded = true;
        return this.getUserMedia.call(navigator, {
          audio: true,
          video: {
            optional: [
              {
                minWidth: 320
              }, {
                minWidth: 640
              }, {
                minWidth: 1024
              }, {
                minWidth: 1280
              }, {
                minWidth: 1920
              }
            ]
          }
        }, function(stream) {
          _this.__setState('ready');
          _this.__stream = stream;
          if (_this.URL) {
            _this.video.prop('src', _this.URL.createObjectURL(stream));
          } else {
            _this.video.prop('src', stream);
          }
          _this.video[0].volume = 0;
          return _this.video[0].play();
        }, function(error) {
          if (error === "NO_DEVICES_FOUND" || error.name === 'DevicesNotFoundError') {
            _this.__setState('not-founded');
          } else {
            _this.__setState('denied');
          }
          return _this.__loaded = false;
        });
      };

      CameraTab.prototype.__revoke = function() {
        var _base;
        this.__setState('requested');
        this.__loaded = false;
        if (!this.__stream) {
          return;
        }
        if (this.URL) {
          this.URL.revokeObjectURL(this.video.prop('src'));
        }
        if (this.__stream.getTracks) {
          $.each(this.__stream.getTracks(), function() {
            return typeof this.stop === "function" ? this.stop() : void 0;
          });
        }
        if (typeof (_base = this.__stream).stop === "function") {
          _base.stop();
        }
        return this.__stream = null;
      };

      CameraTab.prototype.__mirror = function() {
        this.mirrored = !this.mirrored;
        return this.video.toggleClass('uploadcare-dialog-camera--mirrored', this.mirrored);
      };

      CameraTab.prototype.__capture = function() {
        var canvas, ctx, h, video, w,
          _this = this;
        video = this.video[0];
        w = video.videoWidth;
        h = video.videoHeight;
        canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        ctx = canvas.getContext('2d');
        if (this.mirrored) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        return utils.canvasToBlob(canvas, 'image/jpeg', 0.9, function(blob) {
          canvas.width = canvas.height = 1;
          blob.name = "camera.jpg";
          _this.dialogApi.addFiles('object', [
            [
              blob, {
                source: 'camera'
              }
            ]
          ]);
          return _this.dialogApi.switchTab('preview');
        });
      };

      CameraTab.prototype.__startRecording = function() {
        var _this = this;
        this.__setState('recording');
        this.__chunks = [];
        this.__recorder = new this.MediaRecorder(this.__stream);
        this.__recorder.start();
        return this.__recorder.ondataavailable = function(e) {
          return _this.__chunks.push(e.data);
        };
      };

      CameraTab.prototype.__stopRecording = function() {
        var _this = this;
        this.__setState('ready');
        this.__recorder.onstop = function() {
          var blob, mime;
          mime = _this.__recorder.mimeType;
          mime = mime ? mime.split('/')[1] : 'webm';
          blob = new Blob(_this.__chunks, {
            'type': "video/" + mime
          });
          blob.name = "record." + mime;
          _this.dialogApi.addFiles('object', [
            [
              blob, {
                source: 'camera'
              }
            ]
          ]);
          _this.dialogApi.switchTab('preview');
          return _this.__chunks = [];
        };
        return this.__recorder.stop();
      };

      CameraTab.prototype.__cancelRecording = function() {
        this.__setState('ready');
        this.__recorder.stop();
        return this.__chunks = [];
      };

      return CameraTab;

    })();
  });

}).call(this);
(function() {
  var $, files, locale, t, tabsCss, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  locale = uploadcare.locale, utils = uploadcare.utils, tabsCss = uploadcare.tabsCss, $ = uploadcare.jQuery, (_ref = uploadcare.locale, t = _ref.t), files = uploadcare.files;

  uploadcare.namespace('widget.tabs', function(ns) {
    return ns.RemoteTab = (function() {
      function RemoteTab(container, tabButton, dialogApi, settings, name) {
        var _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.name = name;
        this.__createIframe = __bind(this.__createIframe, this);
        this.container.addClass('uploadcare-dialog-remote-iframe-wrap');
        this.dialogApi.progress(function(name) {
          if (name === _this.name) {
            _this.__createIframe();
          }
          return _this.__sendMessage({
            type: 'visibility-changed',
            visible: name === _this.name
          });
        });
      }

      RemoteTab.prototype.remoteUrl = function() {
        return ("" + this.settings.socialBase + "/window/" + this.name + "?") + $.param({
          lang: this.settings.locale,
          public_key: this.settings.publicKey,
          widget_version: uploadcare.version,
          images_only: this.settings.imagesOnly,
          pass_window_open: this.settings.passWindowOpen
        });
      };

      RemoteTab.prototype.__sendMessage = function(messageObj) {
        var _ref1;
        return (_ref1 = this.iframe) != null ? _ref1[0].contentWindow.postMessage(JSON.stringify(messageObj), '*') : void 0;
      };

      RemoteTab.prototype.__createIframe = function() {
        var iframe,
          _this = this;
        if (this.iframe) {
          return;
        }
        this.iframe = $('<iframe>', {
          src: this.remoteUrl(),
          marginheight: 0,
          marginwidth: 0,
          frameborder: 0,
          allowTransparency: "true"
        }).addClass('uploadcare-dialog-remote-iframe').appendTo(this.container).on('load', function() {
          var style, url, _i, _j, _len, _len1, _ref1, _ref2;
          _this.iframe.css('opacity', '1');
          _ref1 = tabsCss.urls;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            url = _ref1[_i];
            _this.__sendMessage({
              type: 'embed-css',
              url: url
            });
          }
          _ref2 = tabsCss.styles;
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            style = _ref2[_j];
            _this.__sendMessage({
              type: 'embed-css',
              style: style
            });
          }
        });
        iframe = this.iframe[0].contentWindow;
        utils.registerMessage('file-selected', iframe, function(message) {
          var file, sourceInfo, url;
          url = (function() {
            var key, type, _i, _len, _ref1;
            if (message.alternatives) {
              _ref1 = _this.settings.preferredTypes;
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                type = _ref1[_i];
                type = utils.globRegexp(type);
                for (key in message.alternatives) {
                  if (type.test(key)) {
                    return message.alternatives[key];
                  }
                }
              }
            }
            return message.url;
          })();
          sourceInfo = $.extend({
            source: _this.name
          }, message.info || {});
          file = new files.UrlFile(url, _this.settings, sourceInfo);
          if (message.filename) {
            file.setName(message.filename);
          }
          if (message.is_image != null) {
            file.setIsImage(message.is_image);
          }
          return _this.dialogApi.addFiles([file.promise()]);
        });
        utils.registerMessage('open-new-window', iframe, function(message) {
          var interval, popup, resolve;
          if (_this.settings.debugUploads) {
            utils.debug("Open new window message.", _this.name);
          }
          popup = window.open(message.url, '_blank');
          if (!popup) {
            utils.warn("Can't open new window. Possible blocked.", _this.name);
            return;
          }
          resolve = function() {
            if (_this.settings.debugUploads) {
              utils.debug("Window is closed.", _this.name);
            }
            return _this.__sendMessage({
              type: 'navigate',
              fragment: ''
            });
          };
          if ('closed' in popup) {
            return interval = setInterval(function() {
              if (popup.closed) {
                clearInterval(interval);
                return resolve();
              }
            }, 100);
          } else {
            return popup.addEventListener('exit', resolve);
          }
        });
        return this.dialogApi.done(function() {
          utils.unregisterMessage('file-selected', iframe);
          return utils.unregisterMessage('open-new-window', iframe);
        });
      };

      return RemoteTab;

    })();
  });

}).call(this);
(function() {
  var $, Circle, _ref, _ref1;

  (_ref = uploadcare.ui, (_ref1 = _ref.progress, Circle = _ref1.Circle)), $ = uploadcare.jQuery;

  uploadcare.namespace('widget.tabs', function(ns) {
    return ns.BasePreviewTab = (function() {
      var PREFIX;

      PREFIX = '.uploadcare-dialog-preview-';

      function BasePreviewTab(container, tabButton, dialogApi, settings, name) {
        var notDisabled,
          _this = this;
        this.container = container;
        this.tabButton = tabButton;
        this.dialogApi = dialogApi;
        this.settings = settings;
        this.name = name;
        this.__initTabButtonCircle();
        notDisabled = ':not(.uploadcare-disabled-el)';
        this.container.on('click', PREFIX + 'back' + notDisabled, function() {
          return _this.dialogApi.fileColl.clear();
        });
        this.container.on('click', PREFIX + 'done' + notDisabled, this.dialogApi.resolve);
      }

      BasePreviewTab.prototype.__initTabButtonCircle = function() {
        var circle, circleDf, circleEl, update,
          _this = this;
        circleEl = $('<div class="uploadcare-dialog-icon">').appendTo(this.tabButton);
        circleDf = $.Deferred();
        update = function() {
          var infos, progress, progressInfo, _i, _len;
          infos = _this.dialogApi.fileColl.lastProgresses();
          progress = 0;
          for (_i = 0, _len = infos.length; _i < _len; _i++) {
            progressInfo = infos[_i];
            progress += ((progressInfo != null ? progressInfo.progress : void 0) || 0) / infos.length;
          }
          return circleDf.notify(progress);
        };
        this.dialogApi.fileColl.onAnyProgress(update);
        this.dialogApi.fileColl.onAdd.add(update);
        this.dialogApi.fileColl.onRemove.add(update);
        update();
        circle = new Circle(circleEl).listen(circleDf.promise());
        return this.dialogApi.progress(circle.update);
      };

      return BasePreviewTab;

    })();
  });

}).call(this);
(function() {
  var $, CropWidget, URL, progress, t, tpl, utils, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = uploadcare.utils, (_ref = uploadcare.utils, (_ref1 = _ref.abilities, URL = _ref1.URL)), (_ref2 = uploadcare.ui, progress = _ref2.progress), (_ref3 = uploadcare.templates, tpl = _ref3.tpl), $ = uploadcare.jQuery, (_ref4 = uploadcare.crop, CropWidget = _ref4.CropWidget), (_ref5 = uploadcare.locale, t = _ref5.t);

  uploadcare.namespace('widget.tabs', function(ns) {
    return ns.PreviewTab = (function(_super) {
      __extends(PreviewTab, _super);

      function PreviewTab() {
        this.__tryToLoadVideoPreview = __bind(this.__tryToLoadVideoPreview, this);
        this.__tryToLoadImagePreview = __bind(this.__tryToLoadImagePreview, this);
        this.__setFile = __bind(this.__setFile, this);
        var _this = this;
        PreviewTab.__super__.constructor.apply(this, arguments);
        $.each(this.dialogApi.fileColl.get(), function(i, file) {
          return _this.__setFile(file);
        });
        this.dialogApi.fileColl.onAdd.add(this.__setFile);
        this.widget = null;
        this.__state = null;
      }

      PreviewTab.prototype.__setFile = function(file) {
        var ifCur, tryToLoadImagePreview, tryToLoadVideoPreview,
          _this = this;
        this.file = file;
        ifCur = function(fn) {
          return function() {
            if (file === _this.file) {
              return fn.apply(null, arguments);
            }
          };
        };
        tryToLoadImagePreview = utils.once(this.__tryToLoadImagePreview);
        tryToLoadVideoPreview = utils.once(this.__tryToLoadVideoPreview);
        this.__setState('unknown', {});
        this.file.progress(ifCur(function(info) {
          var blob, label, source;
          info = info.incompleteFileInfo;
          label = (info.name || "") + utils.readableFileSize(info.size, '', ', ');
          _this.element('label').text(label);
          source = info.sourceInfo;
          blob = utils.abilities.Blob;
          if (source.file && blob && source.file instanceof blob) {
            return tryToLoadImagePreview(file, source.file).fail(function() {
              return tryToLoadVideoPreview(file, source.file);
            });
          }
        }));
        this.file.done(ifCur(function(info) {
          var state;
          if (_this.__state === 'video') {
            return;
          }
          state = info.isImage ? 'image' : 'regular';
          if (state !== 'image' || state !== _this.__state) {
            return _this.__setState(state, {
              file: info
            });
          }
        }));
        return this.file.fail(ifCur(function(error, info) {
          return _this.__setState('error', {
            error: error,
            file: info
          });
        }));
      };

      PreviewTab.prototype.__tryToLoadImagePreview = function(file, blob) {
        var df,
          _this = this;
        df = $.Deferred();
        if (file.state() !== 'pending' || !blob.size || blob.size >= this.settings.multipartMinSize) {
          return df.reject().promise();
        }
        utils.image.drawFileToCanvas(blob, 1550, 924, '#efefef', this.settings.imagePreviewMaxSize).done(function(canvas, size) {
          return utils.canvasToBlob(canvas, 'image/jpeg', 0.95, function(blob) {
            var src;
            df.resolve();
            canvas.width = canvas.height = 1;
            if (file.state() !== 'pending' || _this.dialogApi.state() !== 'pending' || _this.file !== file) {
              return;
            }
            src = URL.createObjectURL(blob);
            _this.dialogApi.always(function() {
              return URL.revokeObjectURL(src);
            });
            _this.__setState('image', {
              file: false
            });
            _this.element('image').attr('src', src);
            return _this.initImage(size);
          });
        }).fail(df.reject);
        return df.promise();
      };

      PreviewTab.prototype.__tryToLoadVideoPreview = function(file, blob) {
        var df, op, src,
          _this = this;
        df = $.Deferred();
        if (!URL || !blob.size) {
          return df.reject().promise();
        }
        src = URL.createObjectURL(blob);
        op = utils.videoLoader(src);
        op.fail(function() {
          URL.revokeObjectURL(src);
          return df.reject();
        }).done(function() {
          df.resolve();
          _this.dialogApi.always(function() {
            return URL.revokeObjectURL(src);
          });
          _this.__setState('video');
          return _this.element('video').attr('src', src);
        });
        return df.promise();
      };

      PreviewTab.prototype.element = function(name) {
        return this.container.find('.uploadcare-dialog-preview-' + name);
      };

      PreviewTab.prototype.__setState = function(state, data) {
        var imgInfo;
        this.__state = state;
        this.container.empty().append(tpl("tab-preview-" + state, data));
        if (state === 'unknown' && this.settings.crop) {
          this.element('done').hide();
        }
        if (state === 'image' && data.file) {
          imgInfo = data.file.originalImageInfo;
          return this.initImage([imgInfo.width, imgInfo.height], data.file.cdnUrlModifiers);
        }
      };

      PreviewTab.prototype.initImage = function(imgSize, cdnModifiers) {
        var done, img, imgLoader, startCrop,
          _this = this;
        img = this.element('image');
        done = this.element('done');
        imgLoader = utils.imageLoader(img.attr('src')).done(function() {
          return _this.element('root').addClass('uploadcare-dialog-preview--loaded');
        }).fail(function() {
          _this.file = null;
          return _this.__setState('error', {
            error: 'loadImage'
          });
        });
        startCrop = function() {
          done.removeClass('uploadcare-disabled-el');
          _this.widget = new CropWidget(img, imgSize, _this.settings.crop[0]);
          if (cdnModifiers) {
            _this.widget.setSelectionFromModifiers(cdnModifiers);
          }
          return done.on('click', function() {
            var newFile;
            newFile = _this.widget.applySelectionToFile(_this.file);
            _this.dialogApi.fileColl.replace(_this.file, newFile);
            return true;
          });
        };
        if (this.settings.crop) {
          this.element('title').text(t('dialog.tabs.preview.crop.title'));
          done.addClass('uploadcare-disabled-el');
          done.text(t('dialog.tabs.preview.crop.done'));
          this.populateCropSizes();
          return imgLoader.done(function() {
            return utils.defer(startCrop);
          });
        }
      };

      PreviewTab.prototype.populateCropSizes = function() {
        var control, currentClass, template,
          _this = this;
        if (this.settings.crop.length <= 1) {
          return;
        }
        this.element('root').addClass('uploadcare-dialog-preview--with-sizes');
        control = this.element('crop-sizes');
        template = control.children();
        currentClass = 'uploadcare-crop-size--current';
        $.each(this.settings.crop, function(i, crop) {
          var caption, gcd, item, prefered, size;
          prefered = crop.preferedSize;
          if (prefered) {
            gcd = utils.gcd(prefered[0], prefered[1]);
            caption = "" + (prefered[0] / gcd) + ":" + (prefered[1] / gcd);
          } else {
            caption = t('dialog.tabs.preview.crop.free');
          }
          item = template.clone().appendTo(control).attr('data-caption', caption).on('click', function(e) {
            if (_this.widget) {
              _this.widget.setCrop(crop);
              control.find('>*').removeClass(currentClass);
              return item.addClass(currentClass);
            }
          });
          if (prefered) {
            size = utils.fitSize(prefered, [40, 40], true);
            return item.children().css({
              width: Math.max(20, size[0]),
              height: Math.max(12, size[1])
            });
          }
        });
        template.remove();
        return control.find('>*').eq(0).addClass(currentClass);
      };

      return PreviewTab;

    })(ns.BasePreviewTab);
  });

}).call(this);
// from https://github.com/homm/jquery-ordering

(function($) {
  function nearestFinder (targets) {
    this.targets = targets;
    this.last = null;
    this.update();
  }
  nearestFinder.prototype = {
    update: function() {
      var rows = {};

      this.targets.each(function(i) {
        var offset = $(this).offset();
        if ( ! (offset.top in rows)) {
          rows[offset.top] = [];
        }
        rows[offset.top].push([offset.left + this.offsetWidth/2, this]);
      });

      this.rows = rows;
    },

    find: function(x, y) {
      var minDistance = Infinity;
      var rows = this.rows;
      var nearestRow, top, nearest;

      for (top in rows) {
        var distance = Math.abs(top - y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestRow = rows[top];
        }
      }

      minDistance = Math.abs(nearestRow[0][0] - x);
      nearest = nearestRow[0][1];
      for (var i = 1; i < nearestRow.length; i++) {
        var distance = Math.abs(nearestRow[i][0] - x);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = nearestRow[i][1];
        }
      }

      return nearest;
    },

    findNotLast: function(x, y) {
      var nearest = this.find(x, y);

      if (this.last && nearest && this.last == nearest) {
        return null;
      }

      return this.last = nearest;
    }
  };


  var movableName = 'uploadcareMovable';
  var sortableName = 'uploadcareSortable';
  var extend = {};
  extend[movableName] = function(o) {
    o = $.extend({
      distance: 4,
      anyButton: false,
      axis: false,
      zIndex: 1000,
      start: $.noop,
      move: $.noop,
      finish: $.noop,
      items: null,
      keepFake: false,
      touch: true
    }, o);

    function fixTouch(e) {
      if ( ! o.touch) {
        return;
      }
      var touch, s;
      s = e.originalEvent.touches;
      if (s && s.length) {
        touch = s[0];
      } else {
        s = e.originalEvent.changedTouches;
        if (s && s.length) {
          touch = s[0];
        } else {
          return;
        }
      }
      e.pageX = touch.pageX;
      e.pageY = touch.pageY;
      e.which = 1;
    }

    var events = 'mousedown.{} touchstart.{}'.replace(/\{}/g, movableName);
    this.on(events, o.items, null, function(eDown) {
      fixTouch(eDown);

      if ( ! o.anyButton && eDown.which != 1) {
        return;
      }
      eDown.preventDefault();

      var dragged = false;
      var $dragged = $(this);
      var $fake = false;
      var originalPos = $dragged.position();  // offset parent

      originalPos.top += $dragged.offsetParent().scrollTop();
      originalPos.left += $dragged.offsetParent().scrollLeft();

      var events = 'mousemove.{} touchmove.{}'.replace(/\{}/g, movableName);
      $(document).on(events, function(eMove) {
        fixTouch(eMove);

        if ( ! dragged && (Math.abs(eMove.pageX - eDown.pageX) > o.distance || Math.abs(eMove.pageY - eDown.pageY) > o.distance)) {
          dragged = true;
          $fake = $dragged.clone()
            .css({
              position: 'absolute',
              zIndex: o.zIndex,
              width: $dragged.width()
            })
            .appendTo($dragged.offsetParent());
          o.start({
            event: eMove,
            dragged: $dragged,
            fake: $fake
          });
        }

        if ( ! dragged) {
          return;
        }
        eMove.preventDefault();

        var dx = o.axis == 'y' ? 0 : eMove.pageX - eDown.pageX;
        var dy = o.axis == 'x' ? 0 : eMove.pageY - eDown.pageY;
        $fake.css({left: dx + originalPos.left, top: dy + originalPos.top});
        o.move({
          event: eMove,
          dragged: $dragged,
          fake: $fake,
          dx: dx,
          dy: dy
        });
      });

      var events = 'mouseup.{} touchend.{} touchcancel.{} touchleave.{}';
      $(document).on(events.replace(/\{}/g, movableName), function(eUp) {
        fixTouch(eUp);

        var events = 'mousemove.{} touchmove.{} mouseup.{} touchend.{} touchcancel.{} touchleave.{}';
        $(document).off(events.replace(/\{}/g, movableName));

        if ( ! dragged) {
          return;
        }
        eUp.preventDefault();

        var dx = eUp.pageX - eDown.pageX;
        var dy = eUp.pageY - eDown.pageY;
        dragged = false;
        o.finish({
          event: eUp,
          dragged: $dragged,
          fake: $fake,
          dx: dx,
          dy: dy
        });
        if ( ! o.keepFake) {
          $fake.remove();
        }
      });
    });
  };

  extend[sortableName] = function(o) {
    var oMovable = $.extend({
      items: '>*'
    }, o);
    var o = $.extend({
      checkBounds: function () {return true;},
      start: $.noop,
      attach: $.noop,
      move: $.noop,
      finish: $.noop
    }, o);
    var finder;
    var initialNext = false;
    var parent = this;

    oMovable.start = function(info) {
      o.start(info);
      finder = new nearestFinder(parent.find(oMovable.items).not(info.fake));
      initialNext = info.dragged.next();
    };

    oMovable.move = function(info) {
      info.nearest = null;

      if (o.checkBounds(info)) {
        var offset = info.fake.offset();
        var nearest = finder.findNotLast(
            offset.left + info.dragged.width() / 2, offset.top);
        info.nearest = $(nearest);

        if (nearest && nearest != info.dragged[0]) {
          if (info.dragged.nextAll().filter(nearest).length > 0) {
            info.dragged.insertAfter(nearest);
          } else {
            info.dragged.insertBefore(nearest);
          }
          o.attach(info);
          finder.last = null;
          finder.update();
        }
      } else if (finder.last !== null) {
        finder.last = null;
        if (initialNext.length) {
          info.dragged.insertBefore(initialNext);
        } else {
          info.dragged.parent().append(info.dragged);
        }
        o.attach(info);
        finder.update();
      }

      o.move(info);
    };

    oMovable.finish = function(info) {
      var offset = info.fake.offset();
      info.nearest = null;
      if (o.checkBounds(info)) {
        info.nearest = $(finder.find(
            offset.left + info.dragged.width() / 2, offset.top));
      }
      o.finish(info);
      finder = null;
    };

    return this[movableName](oMovable);
  };
  $.fn.extend(extend);
})(uploadcare.jQuery);
(function() {
  var $, progress, t, tpl, utils, _ref, _ref1, _ref2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = uploadcare.utils, (_ref = uploadcare.ui, progress = _ref.progress), (_ref1 = uploadcare.templates, tpl = _ref1.tpl), $ = uploadcare.jQuery, (_ref2 = uploadcare.locale, t = _ref2.t);

  uploadcare.namespace('widget.tabs', function(ns) {
    return ns.PreviewTabMultiple = (function(_super) {
      __extends(PreviewTabMultiple, _super);

      function PreviewTabMultiple() {
        this.__fileReplaced = __bind(this.__fileReplaced, this);
        this.__fileRemoved = __bind(this.__fileRemoved, this);
        this.__fileAdded = __bind(this.__fileAdded, this);
        this.__fileFailed = __bind(this.__fileFailed, this);
        this.__fileDone = __bind(this.__fileDone, this);
        this.__fileProgress = __bind(this.__fileProgress, this);
        this.__updateContainerView = __bind(this.__updateContainerView, this);
        var _this = this;
        PreviewTabMultiple.__super__.constructor.apply(this, arguments);
        this.container.append(tpl('tab-preview-multiple'));
        this.__fileTpl = $(tpl('tab-preview-multiple-file'));
        this.fileListEl = this.container.find('.uploadcare-file-list');
        this.titleEl = this.__find('title');
        this.mobileTitleEl = this.__find('mobile-title');
        this.footerTextEl = this.__find('footer-text');
        this.doneBtnEl = this.container.find('.uploadcare-dialog-preview-done');
        $.each(this.dialogApi.fileColl.get(), function(i, file) {
          return _this.__fileAdded(file);
        });
        this.__updateContainerView();
        this.dialogApi.fileColl.onAdd.add(this.__fileAdded, this.__updateContainerView);
        this.dialogApi.fileColl.onRemove.add(this.__fileRemoved, this.__updateContainerView);
        this.dialogApi.fileColl.onReplace.add(this.__fileReplaced, this.__updateContainerView);
        this.dialogApi.fileColl.onAnyProgress(this.__fileProgress);
        this.dialogApi.fileColl.onAnyDone(this.__fileDone);
        this.dialogApi.fileColl.onAnyFail(this.__fileFailed);
        this.fileListEl.addClass(this.settings.imagesOnly ? 'uploadcare-file-list_tiles' : 'uploadcare-file-list_table');
        this.__setupSorting();
      }

      PreviewTabMultiple.prototype.__setupSorting = function() {
        var _this = this;
        return this.fileListEl.uploadcareSortable({
          touch: false,
          axis: this.settings.imagesOnly ? 'xy' : 'y',
          start: function(info) {
            return info.dragged.css('visibility', 'hidden');
          },
          finish: function(info) {
            var elements, index;
            info.dragged.css('visibility', 'visible');
            elements = _this.container.find('.uploadcare-file-item');
            index = function(file) {
              return elements.index(_this.__fileToEl(file));
            };
            return _this.dialogApi.fileColl.sort(function(a, b) {
              return index(a) - index(b);
            });
          }
        });
      };

      PreviewTabMultiple.prototype.__find = function(s, context) {
        if (context == null) {
          context = this.container;
        }
        return $('.uploadcare-dpm-' + s, context);
      };

      PreviewTabMultiple.prototype.__updateContainerView = function() {
        var files, footer, title, tooFewFiles, tooManyFiles;
        files = this.dialogApi.fileColl.length();
        tooManyFiles = this.settings.multipleMax !== 0 && files > this.settings.multipleMax;
        tooFewFiles = files < this.settings.multipleMin;
        this.doneBtnEl.toggleClass('uploadcare-disabled-el', tooManyFiles || tooFewFiles);
        title = t('dialog.tabs.preview.multiple.title').replace('%files%', t('file', files));
        this.titleEl.text(title);
        footer = tooManyFiles ? t('dialog.tabs.preview.multiple.tooManyFiles').replace('%max%', this.settings.multipleMax) : files && tooFewFiles ? t('dialog.tabs.preview.multiple.tooFewFiles').replace('%min%', this.settings.multipleMin).replace('%files%', t('file', files)) : t('dialog.tabs.preview.multiple.question');
        this.footerTextEl.toggleClass('uploadcare-error', tooManyFiles || tooFewFiles).text(footer);
        return this.mobileTitleEl.toggleClass('uploadcare-error', tooManyFiles || tooFewFiles).text(tooManyFiles || tooFewFiles ? footer : title);
      };

      PreviewTabMultiple.prototype.__updateFileInfo = function(fileEl, info) {
        fileEl.find('.uploadcare-file-item__name').text(info.name || t('dialog.tabs.preview.unknownName'));
        return fileEl.find('.uploadcare-file-item__size').text(utils.readableFileSize(info.size, '–'));
      };

      PreviewTabMultiple.prototype.__fileProgress = function(file, progressInfo) {
        var fileEl;
        fileEl = this.__fileToEl(file);
        fileEl.find('.uploadcare-progressbar__value').css('width', Math.round(progressInfo.progress * 100) + '%');
        return this.__updateFileInfo(fileEl, progressInfo.incompleteFileInfo);
      };

      PreviewTabMultiple.prototype.__fileDone = function(file, info) {
        var cdnURL, fileEl,
          _this = this;
        fileEl = this.__fileToEl(file).removeClass('uploadcare-file-item_uploading').addClass('uploadcare-file-item_uploaded');
        fileEl.find('.uploadcare-progressbar__value').css('width', '100%');
        this.__updateFileInfo(fileEl, info);
        if (info.isImage) {
          cdnURL = ("" + info.cdnUrl + "-/quality/lightest/") + (this.settings.imagesOnly ? "-/preview/340x340/" : "-/scale_crop/110x110/center/");
          return fileEl.find('.uploadcare-file-item__preview').addClass('uploadcare-zoomable-icon').html($('<img>').attr('src', cdnURL)).on('click', function() {
            return uploadcare.openPreviewDialog(file, _this.settings).done(function(newFile) {
              return _this.dialogApi.fileColl.replace(file, newFile);
            });
          });
        }
      };

      PreviewTabMultiple.prototype.__fileFailed = function(file, error, info) {
        return this.__fileToEl(file).removeClass('uploadcare-file-item_uploading').addClass('uploadcare-file-item_error').find('.uploadcare-file-item__error').text(t("errors." + error));
      };

      PreviewTabMultiple.prototype.__fileAdded = function(file) {
        var fileEl;
        fileEl = this.__createFileEl(file);
        return fileEl.appendTo(this.fileListEl);
      };

      PreviewTabMultiple.prototype.__fileRemoved = function(file) {
        this.__fileToEl(file).remove();
        return $(file).removeData();
      };

      PreviewTabMultiple.prototype.__fileReplaced = function(oldFile, newFile) {
        var fileEl;
        fileEl = this.__createFileEl(newFile);
        fileEl.insertAfter(this.__fileToEl(oldFile));
        return this.__fileRemoved(oldFile);
      };

      PreviewTabMultiple.prototype.__fileToEl = function(file) {
        return $(file).data('dpm-el') || $();
      };

      PreviewTabMultiple.prototype.__createFileEl = function(file) {
        var fileEl,
          _this = this;
        fileEl = this.__fileTpl.clone().on('click', '.uploadcare-remove', function() {
          return _this.dialogApi.fileColl.remove(file);
        });
        $(file).data('dpm-el', fileEl);
        return fileEl;
      };

      return PreviewTabMultiple;

    })(ns.BasePreviewTab);
  });

}).call(this);
(function() {
  var $, files, s, t, tabs, tpl, utils, _ref, _ref1, _ref2,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  utils = uploadcare.utils, (_ref = uploadcare.locale, t = _ref.t), (_ref1 = uploadcare.templates, tpl = _ref1.tpl), files = uploadcare.files, (_ref2 = uploadcare.widget, tabs = _ref2.tabs), s = uploadcare.settings, $ = uploadcare.jQuery;

  uploadcare.namespace('', function(ns) {
    var Panel, currentDialogPr, lockScroll, openedClass, registeredTabs,
      _this = this;
    lockScroll = function(el, toTop) {
      var left, top;
      top = el.scrollTop();
      left = el.scrollLeft();
      if (toTop) {
        el.scrollTop(0).scrollLeft(0);
      }
      return function() {
        return el.scrollTop(top).scrollLeft(left);
      };
    };
    $(window).on('keydown', function(e) {
      if (ns.isDialogOpened()) {
        if (e.which === 27) {
          e.stopImmediatePropagation();
          return typeof currentDialogPr !== "undefined" && currentDialogPr !== null ? currentDialogPr.reject() : void 0;
        }
      }
    });
    currentDialogPr = null;
    openedClass = 'uploadcare-dialog-opened';
    ns.isDialogOpened = function() {
      return currentDialogPr !== null;
    };
    ns.closeDialog = function() {
      var _results;
      _results = [];
      while (currentDialogPr) {
        _results.push(currentDialogPr.reject());
      }
      return _results;
    };
    ns.openDialog = function(files, tab, settings) {
      var cancelLock, dialog, dialogPr;
      ns.closeDialog();
      dialog = $(tpl('dialog')).appendTo('body');
      dialogPr = ns.openPanel(dialog.find('.uploadcare-dialog-placeholder'), files, tab, settings);
      dialog.addClass('uploadcare-active');
      dialogPr.dialogElement = dialog;
      cancelLock = lockScroll($(window), dialog.css('position') === 'absolute');
      $('html, body').addClass(openedClass);
      dialog.on('click', '.uploadcare-dialog-close', dialogPr.reject);
      dialog.on('dblclick', function(e) {
        var showStoppers;
        if (!$.contains(document.documentElement, e.target)) {
          return;
        }
        showStoppers = '.uploadcare-dialog-panel, a';
        if ($(e.target).is(showStoppers) || $(e.target).parents(showStoppers).length) {
          return;
        }
        return dialogPr.reject();
      });
      return currentDialogPr = dialogPr.always(function() {
        $('html, body').removeClass(openedClass);
        currentDialogPr = null;
        dialog.remove();
        return cancelLock();
      });
    };
    ns.openPreviewDialog = function(file, settings) {
      var dialog, oldDialogPr,
        _this = this;
      oldDialogPr = currentDialogPr;
      currentDialogPr = null;
      settings = $.extend({}, settings, {
        multiple: false,
        tabs: ''
      });
      dialog = uploadcare.openDialog(file, 'preview', settings);
      oldDialogPr.dialogElement.addClass('uploadcare-inactive');
      dialog.always(function() {
        currentDialogPr = oldDialogPr;
        $('html, body').addClass(openedClass);
        return oldDialogPr.dialogElement.removeClass('uploadcare-inactive');
      });
      dialog.onTabVisibility(function(tab, shown) {
        if (tab === 'preview' && !shown) {
          return dialog.reject();
        }
      });
      return dialog;
    };
    ns.openPanel = function(placeholder, files, tab, settings) {
      var filter, panel;
      if ($.isPlainObject(tab)) {
        settings = tab;
        tab = null;
      }
      if (!files) {
        files = [];
      } else if (utils.isFileGroup(files)) {
        files = files.files();
      } else if (!$.isArray(files)) {
        files = [files];
      }
      settings = s.build(settings);
      panel = new Panel(settings, placeholder, files, tab).publicPromise();
      filter = function(files) {
        if (settings.multiple) {
          return uploadcare.FileGroup(files, settings);
        } else {
          return files[0];
        }
      };
      return utils.then(panel, filter, filter).promise(panel);
    };
    registeredTabs = {};
    ns.registerTab = function(tabName, constructor) {
      return registeredTabs[tabName] = constructor;
    };
    ns.registerTab('file', tabs.FileTab);
    ns.registerTab('url', tabs.UrlTab);
    ns.registerTab('camera', tabs.CameraTab);
    ns.registerTab('facebook', tabs.RemoteTab);
    ns.registerTab('dropbox', tabs.RemoteTab);
    ns.registerTab('gdrive', tabs.RemoteTab);
    ns.registerTab('instagram', tabs.RemoteTab);
    ns.registerTab('flickr', tabs.RemoteTab);
    ns.registerTab('vk', tabs.RemoteTab);
    ns.registerTab('evernote', tabs.RemoteTab);
    ns.registerTab('box', tabs.RemoteTab);
    ns.registerTab('skydrive', tabs.RemoteTab);
    ns.registerTab('huddle', tabs.RemoteTab);
    ns.registerTab('empty-pubkey', function(tabPanel, _1, _2, settings) {
      return tabPanel.append(settings._emptyKeyText);
    });
    ns.registerTab('preview', function(tabPanel, tabButton, dialogApi, settings, name) {
      var tabCls;
      tabCls = settings.multiple ? tabs.PreviewTabMultiple : tabs.PreviewTab;
      return new tabCls(tabPanel, tabButton, dialogApi, settings, name);
    });
    return Panel = (function() {
      var tabClass;

      tabClass = 'uploadcare-dialog-tab';

      function Panel(settings, placeholder, files, tab) {
        var sel,
          _this = this;
        this.settings = settings;
        this.isTabVisible = __bind(this.isTabVisible, this);
        this.hideTab = __bind(this.hideTab, this);
        this.showTab = __bind(this.showTab, this);
        this.switchTab = __bind(this.switchTab, this);
        this.__closePanel = __bind(this.__closePanel, this);
        this.__updateFooter = __bind(this.__updateFooter, this);
        this.__reject = __bind(this.__reject, this);
        this.__resolve = __bind(this.__resolve, this);
        this.addFiles = __bind(this.addFiles, this);
        this.dfd = $.Deferred();
        this.dfd.always(this.__closePanel);
        sel = '.uploadcare-dialog-panel';
        this.content = $(tpl('panel'));
        this.panel = this.content.find(sel).add(this.content.filter(sel));
        this.placeholder = $(placeholder);
        this.placeholder.replaceWith(this.content);
        if (this.settings.multiple) {
          this.panel.addClass('uploadcare-dialog-multiple');
        }
        this.files = new utils.CollectionOfPromises(files);
        this.files.onRemove.add(function() {
          if (_this.files.length() === 0) {
            return _this.hideTab('preview');
          }
        });
        this.__autoCrop(this.files);
        this.tabs = {};
        this.__prepareFooter();
        this.onTabVisibility = $.Callbacks().add(function(tab, show) {
          return _this.panel.find("." + tabClass + "-" + tab).toggleClass("" + tabClass + "_hidden", !show);
        });
        if (this.settings.publicKey) {
          this.__prepareTabs(tab);
        } else {
          this.__welcome();
        }
      }

      Panel.prototype.publicPromise = function() {
        if (!this.promise) {
          this.promise = this.dfd.promise({
            reject: this.__reject,
            resolve: this.__resolve,
            fileColl: this.files,
            addFiles: this.addFiles,
            switchTab: this.switchTab,
            hideTab: this.hideTab,
            showTab: this.showTab,
            isTabVisible: this.isTabVisible,
            onTabVisibility: utils.publicCallbacks(this.onTabVisibility)
          });
        }
        return this.promise;
      };

      Panel.prototype.addFiles = function(files, data) {
        var file, _i, _len;
        if (data) {
          files = ns.filesFrom(files, data, this.settings);
        }
        if (!this.settings.multiple) {
          this.files.clear();
        }
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          if (this.settings.multipleMaxStrict && this.settings.multipleMax !== 0) {
            if (this.files.length() >= this.settings.multipleMax) {
              file.cancel();
              continue;
            }
          }
          this.files.add(file);
        }
        if (this.settings.previewStep) {
          this.showTab('preview');
          if (!this.settings.multiple) {
            return this.switchTab('preview');
          }
        } else {
          return this.__resolve();
        }
      };

      Panel.prototype.__autoCrop = function(files) {
        var crop, _i, _len, _ref3,
          _this = this;
        if (!this.settings.crop || !this.settings.multiple) {
          return;
        }
        _ref3 = this.settings.crop;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          crop = _ref3[_i];
          if (!crop.preferedSize) {
            return;
          }
        }
        return files.onAnyDone(function(file, fileInfo) {
          var info, newFile, size;
          if (!fileInfo.isImage || fileInfo.cdnUrlModifiers || fileInfo.crop) {
            return;
          }
          info = fileInfo.originalImageInfo;
          size = uploadcare.utils.fitSize(_this.settings.crop[0].preferedSize, [info.width, info.height], true);
          newFile = utils.applyCropSelectionToFile(file, _this.settings.crop[0], [info.width, info.height], {
            width: size[0],
            height: size[1],
            left: Math.round((info.width - size[0]) / 2),
            top: Math.round((info.height - size[1]) / 2)
          });
          return files.replace(file, newFile);
        });
      };

      Panel.prototype.__resolve = function() {
        return this.dfd.resolve(this.files.get());
      };

      Panel.prototype.__reject = function() {
        return this.dfd.reject(this.files.get());
      };

      Panel.prototype.__prepareTabs = function(tab) {
        var tabName, _i, _len, _ref3;
        this.addTab('preview');
        _ref3 = this.settings.tabs;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          tabName = _ref3[_i];
          this.addTab(tabName);
        }
        if (this.files.length()) {
          this.showTab('preview');
          this.switchTab('preview');
        } else {
          this.hideTab('preview');
          this.switchTab(tab || this.__firstVisibleTab());
        }
        if (this.settings.tabs.length === 0) {
          return this.panel.addClass('uploadcare-panel-hide-tabs');
        }
      };

      Panel.prototype.__prepareFooter = function() {
        var notDisabled,
          _this = this;
        this.footer = this.panel.find('.uploadcare-panel-footer');
        notDisabled = ':not(.uploadcare-disabled-el)';
        this.footer.on('click', '.uploadcare-dialog-button' + notDisabled, function() {
          return _this.switchTab('preview');
        });
        this.footer.on('click', '.uploadcare-dialog-button-success' + notDisabled, this.__resolve);
        this.__updateFooter();
        this.files.onAdd.add(this.__updateFooter);
        return this.files.onRemove.add(this.__updateFooter);
      };

      Panel.prototype.__updateFooter = function() {
        var footer, tooFewFiles, tooManyFiles;
        files = this.files.length();
        tooManyFiles = this.settings.multipleMax !== 0 && files > this.settings.multipleMax;
        tooFewFiles = files < this.settings.multipleMin;
        this.footer.find('.uploadcare-dialog-button-success').toggleClass('uploadcare-disabled-el', tooManyFiles || tooFewFiles);
        this.footer.find('.uploadcare-dialog-button').toggleClass('uploadcare-disabled-el', files === 0);
        footer = tooManyFiles ? t('dialog.tabs.preview.multiple.tooManyFiles').replace('%max%', this.settings.multipleMax) : files && tooFewFiles ? t('dialog.tabs.preview.multiple.tooFewFiles').replace('%min%', this.settings.multipleMin) : t('dialog.tabs.preview.multiple.title');
        this.footer.find('.uploadcare-panel-footer-text').toggleClass('uploadcare-error', tooManyFiles).text(footer.replace('%files%', t('file', files)));
        return this.footer.find('.uploadcare-panel-footer-counter').toggleClass('uploadcare-error', tooManyFiles).text(files ? "(" + files + ")" : "");
      };

      Panel.prototype.__closePanel = function() {
        this.panel.replaceWith(this.placeholder);
        return this.content.remove();
      };

      Panel.prototype.addTab = function(name) {
        var TabCls, tabButton, tabPanel,
          _this = this;
        if (name in this.tabs) {
          return;
        }
        TabCls = registeredTabs[name];
        if (!TabCls) {
          throw new Error("No such tab: " + name);
        }
        tabPanel = $('<div>').addClass("" + tabClass + "s-panel").addClass("" + tabClass + "s-panel-" + name).insertBefore(this.footer);
        tabButton = $('<div>', {
          role: 'button',
          tabindex: "0"
        }).addClass(tabClass).addClass("" + tabClass + "-" + name).attr('title', t("dialog.tabs.names." + name)).appendTo(this.panel.find("." + tabClass + "s")).on('click', function() {
          if (name === _this.currentTab) {
            return _this.panel.toggleClass('uploadcare-dialog-opened-tabs');
          } else {
            return _this.switchTab(name);
          }
        });
        return this.tabs[name] = new TabCls(tabPanel, tabButton, this.publicPromise(), this.settings, name);
      };

      Panel.prototype.switchTab = function(tab) {
        var className;
        if (!tab) {
          return;
        }
        this.currentTab = tab;
        this.panel.removeClass('uploadcare-dialog-opened-tabs');
        this.panel.find("." + tabClass).removeClass("" + tabClass + "_current").filter("." + tabClass + "-" + tab).addClass("" + tabClass + "_current");
        className = "" + tabClass + "s-panel";
        this.panel.find("." + className).removeClass("" + className + "_current").filter("." + className + "-" + tab).addClass("" + className + "_current");
        return this.dfd.notify(tab);
      };

      Panel.prototype.showTab = function(tab) {
        return this.onTabVisibility.fire(tab, true);
      };

      Panel.prototype.hideTab = function(tab) {
        this.onTabVisibility.fire(tab, false);
        if (this.currentTab === tab) {
          return this.switchTab(this.__firstVisibleTab());
        }
      };

      Panel.prototype.isTabVisible = function(tab) {
        return !this.panel.find("." + tabClass + "-" + tab).is("." + tabClass + "_hidden");
      };

      Panel.prototype.__firstVisibleTab = function() {
        var tab, _i, _len, _ref3;
        _ref3 = this.settings.tabs;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          tab = _ref3[_i];
          if (this.isTabVisible(tab)) {
            return tab;
          }
        }
      };

      Panel.prototype.__welcome = function() {
        var tabName, _i, _len, _ref3;
        this.addTab('empty-pubkey');
        this.switchTab('empty-pubkey');
        _ref3 = this.settings.tabs;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          tabName = _ref3[_i];
          this.__addFakeTab(tabName);
        }
        return null;
      };

      Panel.prototype.__addFakeTab = function(name) {
        return $('<div>').addClass("" + tabClass + " " + tabClass + "-" + name).addClass('uploadcare-dialog-disabled-tab').attr('title', t("dialog.tabs.names." + name)).appendTo(this.panel.find("." + tabClass + "s"));
      };

      return Panel;

    })();
  });

}).call(this);
(function() {
  var $, dragdrop, t, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  utils = uploadcare.utils, $ = uploadcare.jQuery, dragdrop = uploadcare.dragdrop, (_ref = uploadcare.locale, t = _ref.t);

  uploadcare.namespace('widget', function(ns) {
    return ns.BaseWidget = (function() {
      function BaseWidget(element, settings) {
        var _this = this;
        this.element = element;
        this.settings = settings;
        this.reloadInfo = __bind(this.reloadInfo, this);
        this.__setObject = __bind(this.__setObject, this);
        this.__reset = __bind(this.__reset, this);
        this.validators = this.settings.validators = [];
        this.currentObject = null;
        this.__onDialogOpen = $.Callbacks();
        this.__onUploadComplete = $.Callbacks();
        this.__onChange = $.Callbacks().add(function(object) {
          return object != null ? object.promise().done(function(info) {
            return _this.__onUploadComplete.fire(info);
          }) : void 0;
        });
        this.__setupWidget();
        this.element.on('change.uploadcare', this.reloadInfo);
        this.__hasValue = false;
        utils.defer(function() {
          if (!_this.__hasValue) {
            return _this.reloadInfo();
          }
        });
      }

      BaseWidget.prototype.__setupWidget = function() {
        var path,
          _this = this;
        this.template = new ns.Template(this.settings, this.element);
        path = ['buttons.choose'];
        path.push(this.settings.imagesOnly ? 'images' : 'files');
        path.push(this.settings.multiple ? 'other' : 'one');
        this.template.addButton('open', t(path.join('.'))).toggleClass('needsclick', this.settings.systemDialog).on('click', function() {
          return _this.openDialog();
        });
        this.template.addButton('cancel', t('buttons.cancel')).on('click', function() {
          return _this.__setObject(null);
        });
        this.template.addButton('remove', t('buttons.remove')).on('click', function() {
          return _this.__setObject(null);
        });
        this.template.content.on('click', '.uploadcare-widget-file-name', function() {
          return _this.openDialog();
        });
        dragdrop.receiveDrop(this.template.content, this.__handleDirectSelection);
        return this.template.reset();
      };

      BaseWidget.prototype.__infoToValue = function(info) {
        if (info.cdnUrlModifiers || this.settings.pathValue) {
          return info.cdnUrl;
        } else {
          return info.uuid;
        }
      };

      BaseWidget.prototype.__reset = function() {
        var object;
        object = this.currentObject;
        this.currentObject = null;
        if (object != null) {
          if (typeof object.cancel === "function") {
            object.cancel();
          }
        }
        return this.template.reset();
      };

      BaseWidget.prototype.__setObject = function(newFile) {
        if (newFile === this.currentObject) {
          return;
        }
        this.__reset();
        if (newFile) {
          this.currentObject = newFile;
          this.__watchCurrentObject();
        } else {
          this.element.val('');
        }
        return this.__onChange.fire(this.currentObject);
      };

      BaseWidget.prototype.__watchCurrentObject = function() {
        var object,
          _this = this;
        object = this.__currentFile();
        if (object) {
          this.template.listen(object);
          return object.done(function(info) {
            if (object === _this.__currentFile()) {
              return _this.__onUploadingDone(info);
            }
          }).fail(function(error) {
            if (object === _this.__currentFile()) {
              return _this.__onUploadingFailed(error);
            }
          });
        }
      };

      BaseWidget.prototype.__onUploadingDone = function(info) {
        this.element.val(this.__infoToValue(info));
        this.template.setFileInfo(info);
        return this.template.loaded();
      };

      BaseWidget.prototype.__onUploadingFailed = function(error) {
        this.template.reset();
        return this.template.error(error);
      };

      BaseWidget.prototype.__setExternalValue = function(value) {
        return this.__setObject(utils.valueToFile(value, this.settings));
      };

      BaseWidget.prototype.value = function(value) {
        if (value !== void 0) {
          this.__hasValue = true;
          this.__setExternalValue(value);
          return this;
        } else {
          return this.currentObject;
        }
      };

      BaseWidget.prototype.reloadInfo = function() {
        return this.value(this.element.val());
      };

      BaseWidget.prototype.openDialog = function(tab) {
        var _this = this;
        if (this.settings.systemDialog) {
          return utils.fileSelectDialog(this.template.content, this.settings, function(input) {
            return _this.__handleDirectSelection('object', input.files);
          });
        } else {
          return this.__openDialog(tab);
        }
      };

      BaseWidget.prototype.__openDialog = function(tab) {
        var dialogApi;
        dialogApi = uploadcare.openDialog(this.currentObject, tab, this.settings);
        this.__onDialogOpen.fire(dialogApi);
        return dialogApi.done(this.__setObject);
      };

      BaseWidget.prototype.api = function() {
        if (!this.__api) {
          this.__api = utils.bindAll(this, ['openDialog', 'reloadInfo', 'value', 'validators']);
          this.__api.onChange = utils.publicCallbacks(this.__onChange);
          this.__api.onUploadComplete = utils.publicCallbacks(this.__onUploadComplete);
          this.__api.onDialogOpen = utils.publicCallbacks(this.__onDialogOpen);
          this.__api.inputElement = this.element.get(0);
        }
        return this.__api;
      };

      return BaseWidget;

    })();
  });

}).call(this);
(function() {
  var $, files, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = uploadcare.utils, files = uploadcare.files, $ = uploadcare.jQuery;

  uploadcare.namespace('widget', function(ns) {
    var _ref;
    return ns.Widget = (function(_super) {
      __extends(Widget, _super);

      function Widget() {
        this.__handleDirectSelection = __bind(this.__handleDirectSelection, this);
        _ref = Widget.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Widget.prototype.__currentFile = function() {
        return this.currentObject;
      };

      Widget.prototype.__handleDirectSelection = function(type, data) {
        var file;
        file = uploadcare.fileFrom(type, data[0], this.settings);
        if (this.settings.systemDialog || !this.settings.previewStep) {
          return this.__setObject(file);
        } else {
          return this.__openDialog('preview').addFiles([file]);
        }
      };

      return Widget;

    })(ns.BaseWidget);
  });

}).call(this);
(function() {
  var $, t, utils, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  utils = uploadcare.utils, $ = uploadcare.jQuery, (_ref = uploadcare.locale, t = _ref.t);

  uploadcare.namespace('widget', function(ns) {
    var _ref1;
    return ns.MultipleWidget = (function(_super) {
      __extends(MultipleWidget, _super);

      function MultipleWidget() {
        this.__handleDirectSelection = __bind(this.__handleDirectSelection, this);
        this.__setObject = __bind(this.__setObject, this);
        _ref1 = MultipleWidget.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      MultipleWidget.prototype.__currentFile = function() {
        var _ref2;
        return (_ref2 = this.currentObject) != null ? _ref2.promise() : void 0;
      };

      MultipleWidget.prototype.__setObject = function(group) {
        if (!utils.isFileGroupsEqual(this.currentObject, group)) {
          return MultipleWidget.__super__.__setObject.apply(this, arguments);
        } else if (!group) {
          this.__reset();
          return this.element.val('');
        }
      };

      MultipleWidget.prototype.__setExternalValue = function(value) {
        var groupPr,
          _this = this;
        this.__lastGroupPr = groupPr = utils.valueToGroup(value, this.settings);
        if (value) {
          this.template.setStatus('started');
          this.template.statusText.text(t('loadingInfo'));
        }
        return groupPr.done(function(group) {
          if (_this.__lastGroupPr === groupPr) {
            return _this.__setObject(group);
          }
        }).fail(function() {
          if (_this.__lastGroupPr === groupPr) {
            return _this.__onUploadingFailed('createGroup');
          }
        });
      };

      MultipleWidget.prototype.__handleDirectSelection = function(type, data) {
        var files;
        files = uploadcare.filesFrom(type, data, this.settings);
        if (this.settings.systemDialog) {
          return this.__setObject(uploadcare.FileGroup(files, this.settings));
        } else {
          return this.__openDialog('preview').addFiles(files);
        }
      };

      return MultipleWidget;

    })(ns.BaseWidget);
  });

}).call(this);
(function() {
  var $, settings, utils;

  utils = uploadcare.utils, settings = uploadcare.settings, $ = uploadcare.jQuery;

  uploadcare.namespace('', function(ns) {
    var cleanup, dataAttr, initialize, initializeWidget, selector;
    dataAttr = 'uploadcareWidget';
    selector = '[role~="uploadcare-uploader"]';
    ns.initialize = function(container) {
      if (container == null) {
        container = ':root';
      }
      return initialize($(container).find(selector));
    };
    initialize = function(targets) {
      var target, widget, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = targets.length; _i < _len; _i++) {
        target = targets[_i];
        widget = $(target).data(dataAttr);
        if (widget && widget.inputElement === target) {
          continue;
        }
        _results.push(initializeWidget(target));
      }
      return _results;
    };
    ns.SingleWidget = function(el) {
      return initializeWidget(el, ns.widget.Widget);
    };
    ns.MultipleWidget = function(el) {
      return initializeWidget(el, ns.widget.MultipleWidget);
    };
    ns.Widget = function(el) {
      return initializeWidget(el);
    };
    initializeWidget = function(input, targetClass) {
      var Widget, api, inputArr, s, widget;
      inputArr = $(input);
      if (inputArr.length === 0) {
        throw new Error("No DOM elements found matching selector");
      } else if (inputArr.length > 1) {
        utils.warn("There are multiple DOM elements matching selector");
      }
      input = inputArr.eq(0);
      s = settings.build(input.data());
      Widget = s.multiple ? ns.widget.MultipleWidget : ns.widget.Widget;
      if (targetClass && Widget !== targetClass) {
        throw new Error("This element should be processed using " + targetClass.name);
      }
      api = input.data(dataAttr);
      if (!api || api.inputElement !== input[0]) {
        cleanup(input);
        widget = new Widget(input, s);
        api = widget.api();
        input.data(dataAttr, api);
        widget.template.content.data(dataAttr, api);
      }
      return api;
    };
    cleanup = function(input) {
      return input.off('.uploadcare').each(function() {
        var widget, widgetElement;
        widgetElement = $(this).next('.uploadcare-widget');
        widget = widgetElement.data(dataAttr);
        if (widget && widget.inputElement === this) {
          return widgetElement.remove();
        }
      });
    };
    ns.start = utils.once(function(s, isolated) {
      s = settings.common(s, isolated);
      if (isolated) {
        return;
      }
      if (s.live) {
        setInterval(ns.initialize, 100);
      }
      return ns.initialize();
    });
    return $(function() {
      if (!window["UPLOADCARE_MANUAL_START"]) {
        return ns.start();
      }
    });
  });

}).call(this);
(function() {
  var $, canSubmit, cancelEvents, submitPreventionState, submittedForm, uploadForm;

  $ = uploadcare.jQuery;

  canSubmit = function(form) {
    var notSubmittable;
    notSubmittable = '[data-status=started], [data-status=error]';
    return !form.find('.uploadcare-widget').is(notSubmittable);
  };

  submitPreventionState = function(form, prevent) {
    form.attr('data-uploadcare-submitted', prevent);
    return form.find(':submit').attr('disabled', prevent);
  };

  uploadForm = '[role~="uploadcare-upload-form"]';

  submittedForm = uploadForm + '[data-uploadcare-submitted]';

  $(document).on('submit', uploadForm, function() {
    var form;
    form = $(this);
    if (canSubmit(form)) {
      return true;
    } else {
      submitPreventionState(form, true);
      return false;
    }
  });

  $(document).on('loaded.uploadcare', submittedForm, function() {
    return $(this).submit();
  });

  cancelEvents = 'ready.uploadcare error.uploadcare';

  $(document).on(cancelEvents, submittedForm, function() {
    var form;
    form = $(this);
    if (canSubmit(form)) {
      return submitPreventionState(form, false);
    }
  });

}).call(this);
(function() {
  var $, fakeButtons, mouseFocusedClass, utils;

  utils = uploadcare.utils, $ = uploadcare.jQuery;

  fakeButtons = ['div.uploadcare-link', 'div.uploadcare-widget-button', 'div.uploadcare-dialog-tab', 'div.uploadcare-dialog-button', 'div.uploadcare-dialog-button-success'].join(', ');

  mouseFocusedClass = 'uploadcare-mouse-focused';

  $(document.documentElement).on('mousedown', fakeButtons, function(e) {
    return utils.defer(function() {
      var activeElement;
      activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) {
        return $(activeElement).addClass(mouseFocusedClass).one('blur', function() {
          return $(activeElement).removeClass(mouseFocusedClass);
        });
      }
    });
  }).on('keypress', fakeButtons, function(e) {
    if (e.which === 13 || e.which === 32) {
      $(this).click();
      e.preventDefault();
      return e.stopPropagation();
    }
  });

}).call(this);
(function() {
  var expose;

  expose = uploadcare.expose;

  expose('globals', uploadcare.settings.common);

  expose('start');

  expose('initialize');

  expose('fileFrom');

  expose('filesFrom');

  expose('FileGroup');

  expose('loadFileGroup');

  expose('openDialog');

  expose('closeDialog');

  expose('openPanel');

  expose('registerTab');

  expose('Circle', uploadcare.ui.progress.Circle);

  expose('SingleWidget');

  expose('MultipleWidget');

  expose('Widget');

  expose('tabsCss');

  expose('dragdrop.support');

  expose('dragdrop.receiveDrop');

  expose('dragdrop.uploadDrop');

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.ar = {
      uploading: 'الرجاء الإنتظار.... يتم الرفع',
      loadingInfo: '...تحميل المعلومات',
      errors: {
        "default": 'خطأ',
        baddata: 'قيمة غير صحيحة',
        size: 'ملف كبير جدا',
        upload: 'لا يمكن تحميل',
        user: ' إلغاء التحميل',
        info: 'لا يمكن تحميل معلومات',
        image: 'مسموح بالصور فقط',
        createGroup: 'لا يمكن إنشاء مجموعة ملفات',
        deleted: 'تم حذف ملف'
      },
      draghere: 'إفلت الملف هنا',
      file: {
        zero: '%1 ملفات',
        one: '%1 ملف',
        two: '%1 ملفات',
        few: '%1 ملفات',
        many: '%1 ملفات',
        other: '%1 ملفات'
      },
      buttons: {
        cancel: 'إلغاء',
        remove: 'إزالة',
        choose: {
          files: {
            one: 'اختر ملف',
            other: 'اختر ملفات'
          },
          images: {
            one: 'اختر صورة',
            other: 'اختر صور'
          }
        }
      },
      dialog: {
        done: 'منجز',
        showFiles: 'إظهار الملفات',
        tabs: {
          names: {
            preview: 'معاينة',
            file: 'الملفات المحلية',
            url: 'روابط التعسفية',
            camera: 'كاميرا'
          },
          file: {
            drag: 'إفلات الملف هنا',
            nodrop: 'تحميل الملفات من جهاز الكمبيوتر الخاص بك',
            cloudsTip: 'المخازن السحابية<br>والخدمات الاجتماعية',
            or: 'أو',
            button: 'اختر ملف محلي',
            also: 'يمكنك أيضا اختيار من'
          },
          url: {
            title: 'الملفات من الويب',
            line1: 'اختر على أي ملف من الويب',
            line2: 'قم بتقديم الارتباط',
            input: 'الصق الرابط الخاص بك هنا ...',
            button: 'تحميل'
          },
          camera: {
            capture: 'إلتقط صورة',
            mirror: 'مرآة',
            retry: 'إعادة طلب الأذونات',
            pleaseAllow: {
              title: 'الرجاء السماح بتشغيل كميرتك ',
              text: 'لقد تم السماح للكاميرا بالوصول لهذا الموقع. ' + 'لكي تلتقط الصور بكاميرتك، يجب السماح لهذا الطلب '
            },
            notFound: {
              title: 'لم يتم العثور على كاميرا ',
              text: 'يبدو أنه لا يوجد كاميرا موصولة بهذا الجهاز'
            }
          },
          preview: {
            unknownName: 'غير معروف',
            change: 'إلغاء',
            back: 'العودة',
            done: 'إضافة',
            unknown: {
              title: 'جاري التحميل .. الرجاء الانتظار للمعاينة.',
              done: 'تخطي المعاينة، واقبل'
            },
            regular: {
              title: 'إضافة هذا الملف؟',
              line1: 'أنت على وشك إضافة الملف أعلاه.',
              line2: 'يرجى تأكيد.'
            },
            image: {
              title: 'إضافة هذه الصورة؟',
              change: 'إلغاء'
            },
            crop: {
              title: 'قص وإضافة هذه الصورة',
              done: 'تم',
              free: 'حرر'
            },
            error: {
              "default": {
                title: 'عفوا!',
                text: 'حدث خطأ أثناء تحميل.',
                back: 'يرجى المحاولة مرة أخرى'
              },
              image: {
                title: 'فقط ملفات الصور مقبولة.',
                text: 'يرجى المحاولة مرة أخرى مع ملف آخر.',
                back: 'اختيار صورة'
              },
              size: {
                title: 'الملف الذي حددته يتجاوز الحد.',
                text: 'يرجى المحاولة مرة أخرى مع ملف آخر.'
              },
              loadImage: {
                title: 'خطأ',
                text: 'لا يمكن تحميل صورة'
              }
            },
            multiple: {
              title: 'لقد أخترت %files%',
              question: 'هل ترغب في إضافة كل من هذه الملفات?',
              tooManyFiles: 'لقد اخترت العديد من الملفات. %max% is الحد الأقصى.',
              tooFewFiles: 'لقد أخترت %files%. على الأقل %min% مطلوب.',
              clear: 'إزالة جميع',
              done: 'تم'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.ar = function(n) {
      var mod;
      if (n === 0) {
        return 'zero';
      }
      if (n === 1) {
        return 'one';
      }
      if (n === 2) {
        return 'two';
      }
      mod = n % 100;
      if ((3 <= mod && mod <= 10)) {
        return 'few';
      }
      if ((11 <= mod && mod <= 99)) {
        return 'many';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.az = {
      uploading: 'Yüklənilir... Lütfən, gözləyin.',
      loadingInfo: 'İnfo yüklənilir...',
      errors: {
        "default": 'Xəta',
        baddata: 'Yanlış dəyər',
        size: 'Fayl çox böyükdür',
        upload: 'Yüklənilə bilmədi',
        user: 'Yükləmə ləğv edildi',
        info: 'İnfo yüklənə bilmədi',
        image: 'Yalnız təsvirlərə icazə verilir',
        createGroup: 'Fayl qrupu yaradıla bilmir',
        deleted: 'Fayl silindi'
      },
      draghere: 'Faylı bura atın',
      file: {
        one: '%1 fayl',
        other: '%1 fayl'
      },
      buttons: {
        cancel: 'Ləğv edin',
        remove: 'Silin',
        choose: {
          files: {
            one: 'Fayl seçin',
            other: 'Fayllar seçin'
          },
          images: {
            one: 'Təsvir seçin',
            other: 'Təsvirlər seçin'
          }
        }
      },
      dialog: {
        done: 'Hazırdır',
        showFiles: 'Faylları göstərin',
        tabs: {
          names: {
            'empty-pubkey': 'Xoş gəlmisiniz',
            preview: 'Önbaxış',
            file: 'Lokal Fayllar',
            url: 'İxtiyari linklər',
            camera: 'Kamera',
            gdrive: 'Google Disk'
          },
          file: {
            drag: 'Faylı bura atın',
            nodrop: 'Kompüterinizdən faylları yükləyin',
            cloudsTip: 'Bulud yaddaşlar <br>və sosial xidmətlər',
            or: 'or',
            button: 'Lokal fayl seçin',
            also: 'Həmçinin, buradan seçə bilərsiniz'
          },
          url: {
            title: 'Vebdən fayllar',
            line1: 'Vebdən istənilən faylı götürün.',
            line2: 'Sadəcə, link verin.',
            input: 'Linkinizi bura yerləşdirin...',
            button: 'Yükləyin'
          },
          camera: {
            capture: 'Şəkil çəkin',
            mirror: 'Güzgü',
            retry: 'Yenidən icazə sorğusu göndərin.',
            pleaseAllow: {
              title: 'Lütfən, kameranıza giriş hüququ verin',
              text: 'Bu saytdan kameranıza daxil olmaq icazəsi verildi. ' + 'Kameranız ilə şəkil çəkmək üçün bu sorğunu təsdiq etməlisiniz.'
            },
            notFound: {
              title: 'Kamera aşkar edilmədi',
              text: 'Görünür, bu cihaza kamera qoşulmayıb.'
            }
          },
          preview: {
            unknownName: 'naməlum',
            change: 'Ləğv edin',
            back: 'Geri',
            done: 'Əlavə edin',
            unknown: {
              title: 'Yüklənilir... Lütfən, önbaxış üçün gözləyin.',
              done: 'Önbaxışı ötürün və qəbul edin'
            },
            regular: {
              title: 'Bu fayl əlavə edilsin?',
              line1: 'Yuxarıdakı faylı əlavə etmək üzrəsiniz.',
              line2: 'Lütfən, təsdiq edin.'
            },
            image: {
              title: 'Bu təsvir əlavə edilsin?',
              change: 'Ləğv edin'
            },
            crop: {
              title: 'Bu təsviri kəsin və əlavə edin',
              done: 'Hazırdır',
              free: 'pulsuz'
            },
            error: {
              "default": {
                title: 'Ups!',
                text: 'Yükləmə zamanı nəsə xəta baş verdi.',
                back: 'Lütfən, y enidən cəhd edin.'
              },
              image: {
                title: 'Yaınız təsvir faylları qəbul olunur.',
                text: 'Lütfən, başqa fayl ilə cəhd edin.',
                back: 'Təsvir seçin'
              },
              size: {
                title: 'Seçdiyiniz fayl limiti keçir.',
                text: 'Lütfən, başqa fayl ilə cəhd edin.'
              },
              loadImage: {
                title: 'Xəta',
                text: 'Təsvir yüklənilə bilmir'
              }
            },
            multiple: {
              title: '%files% fayl seçdiniz.',
              question: 'Bütün bu faylları əlavə etmək istəyirsiniz?',
              tooManyFiles: 'Həddindən çox fayl seçdiniz. %max% maksimumdur.',
              tooFewFiles: '%files% fayl seçdiniz. Ən azı %min% tələb olunur.',
              clear: 'Hamısını silin',
              done: 'Hazırdır'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.az = function(n) {
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.ca = {
      uploading: 'Carregant... Si us plau esperi.',
      loadingInfo: 'Carregant informació...',
      errors: {
        "default": 'Error',
        baddata: 'Valor incorrecte',
        size: 'Massa gran',
        upload: 'No s\'ha pogut carregar',
        user: 'Carrega cancel·lada',
        info: 'No s\'ha pogut carregar la informació',
        image: 'Només es permeten imatges',
        createGroup: 'No es pot crear el grup d\'arxius',
        deleted: 'Fitxer eliminat'
      },
      draghere: 'Arrossega els fitxers fins aquí',
      file: {
        one: '%1 fitxer',
        other: '%1 fitxers'
      },
      buttons: {
        cancel: 'Cancel·lar',
        remove: 'Eliminar',
        choose: {
          files: {
            one: 'Escull un fitxer',
            other: 'Escull fitxers'
          },
          images: {
            one: 'Escull una imatge',
            other: 'Escull imatges'
          }
        }
      },
      dialog: {
        done: 'Fet',
        showFiles: 'Mostra fitxers',
        tabs: {
          names: {
            'empty-pubkey': 'Benvingut',
            preview: 'Avanci',
            file: 'Ordinador',
            url: 'Enllaços arbitraris',
            camera: 'Càmera'
          },
          file: {
            drag: 'Arrossega un fitxer aquí',
            nodrop: 'Carrega fitxers des del teu ordinador',
            cloudsTip: 'Emmagatzematge al núvol<br>i xarxes socials',
            or: 'o',
            button: 'Escull un fitxer des del teu ordinador',
            also: 'També pots seleccionar-lo de'
          },
          url: {
            title: 'Fitxers de la web',
            line1: 'Selecciona qualsevol fitxer de la web.',
            line2: 'Només proporcioni el link.',
            input: 'Copiï el link aquí...',
            button: 'Pujar'
          },
          camera: {
            capture: 'Realitza una foto',
            mirror: 'Mirall',
            retry: 'Demanar permisos una altra vegada',
            pleaseAllow: {
              title: 'Si us plau, permet accés a la teva càmera',
              text: 'Aquest lloc t\'ha demanat de permetre accés a la càmera. ' + 'Per tal de realitzar imatges amb la teva càmera has d\'acceptar aquesta petició.'
            },
            notFound: {
              title: 'No s\'ha detectat cap càmera',
              text: 'Sembla que no tens cap càmera connectada a aquest dispositiu.'
            }
          },
          preview: {
            unknownName: 'desconegut',
            change: 'Cancel·lar',
            back: 'Endarrere',
            done: 'Pujar',
            unknown: {
              title: 'Carregant. Si us plau esperi per la visualització prèvia.',
              done: 'Saltar visualització prèvia i acceptar'
            },
            regular: {
              title: 'Vols pujar aquest fitxer?',
              line1: 'Estàs a punt de pujar el fitxer superior.',
              line2: 'Confirmi, si us plau.'
            },
            image: {
              title: 'Vols pujar aquesta imatge?',
              change: 'Cancel·lar'
            },
            crop: {
              title: 'Tallar i pujar aquesta imatge',
              done: 'Fet',
              free: 'lliure'
            },
            error: {
              "default": {
                title: 'La pujada ha fallat!',
                text: 'S\'ha produït un error durant la pujada.',
                back: 'Si us plau, provi-ho de nou.'
              },
              image: {
                title: 'Només s\'accepten fitxers d\'imatges.',
                text: 'Si us plau, provi-ho de nou amb un altre fitxer.',
                back: 'Escull imatge'
              },
              size: {
                title: 'La mida del fitxer que has seleccionat sobrepassa el límit.',
                text: 'Si us plau, provi-ho de nou amb un altre fitxer.'
              },
              loadImage: {
                title: 'Error',
                text: 'No s\'ha pogut carregar la imatge'
              }
            },
            multiple: {
              title: 'N\'has escollit %files%',
              question: 'Vols afegir tots aquests fitxers?',
              tooManyFiles: 'Has escollit massa fitxers. %max% és el màxim.',
              tooFewFiles: 'Has escollit %files%. Com a mínim en calen %min%.',
              clear: 'Eliminar-los tots',
              done: 'Fet'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.ca = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.cs = {
      uploading: 'Nahrávám... Malý moment.',
      loadingInfo: 'Nahrávám informace...',
      errors: {
        "default": 'Chyba',
        baddata: 'Neplatná hodnota',
        size: 'Soubor je příliš velký',
        upload: 'Nelze nahrát',
        user: 'Nahrávání zrušeno',
        info: 'Nelze nahrát informace',
        image: 'Lze nahrát pouze obrázky',
        createGroup: 'Nelze vytvořit adresář',
        deleted: 'Soubor byl smazán'
      },
      draghere: 'Přetáhněte soubor sem',
      file: {
        one: '%1 soubor',
        few: '%1 soubory',
        many: '%1 souborů'
      },
      buttons: {
        cancel: 'Zrušit',
        remove: 'Odstranit',
        choose: {
          files: {
            one: 'Vyberte soubor',
            other: 'Vyberte soubory'
          },
          images: {
            one: 'Vyberte obrázek',
            other: 'Vyberte obrázky'
          }
        }
      },
      dialog: {
        done: 'Hotovo',
        showFiles: 'Zobrazit soubory',
        tabs: {
          names: {
            'empty-pubkey': 'Vítejte',
            preview: 'Náhled',
            file: 'Soubor z počítače',
            url: 'Soubor z internetu',
            camera: 'Webkamera',
            facebook: 'Facebook',
            dropbox: 'Dropbox',
            gdrive: 'Google Drive',
            instagram: 'Instagram',
            vk: 'VK',
            evernote: 'Evernote',
            box: 'Box',
            skydrive: 'OneDrive',
            flickr: 'Flickr',
            huddle: 'Huddle'
          },
          file: {
            drag: 'Přetáhněte soubor sem',
            nodrop: 'Nahrajte soubory z vašeho počítače',
            cloudsTip: 'Cloudové úložiště<br>a sociální sítě',
            or: 'nebo',
            button: 'Vyberte soubor z počítače',
            also: 'Můžete také nahrát soubor z'
          },
          url: {
            title: 'Soubory z internetu',
            line1: 'Nahrajte jakýkoliv soubor z internetu.',
            line2: 'Stačí vložit odkaz.',
            input: 'Odkaz vložte zde...',
            button: 'Nahrát'
          },
          camera: {
            capture: 'Pořídit fotografii',
            mirror: 'Zrcadlo',
            retry: 'Znovu požádat o povolení',
            pleaseAllow: {
              title: 'Prosím povolte přístup k webkameře',
              text: 'Byl(a) jste požádán(a) o přístup k webkameře. ' + 'Abyste mohl(a) pořídit fotografii, musíte přístup povolit.'
            },
            notFound: {
              title: 'Nebyla nalezena webkamera',
              text: 'Zdá se, že k tomuto zařízení není připojena žádná webkamera.'
            }
          },
          preview: {
            unknownName: 'neznámý',
            change: 'Zrušit',
            back: 'Zpět',
            done: 'Přidat',
            unknown: {
              title: 'Nahrávám... Prosím vyčkejte na náhled.',
              done: 'Přeskočit náhled a odeslat'
            },
            regular: {
              title: 'Přidat tento soubor?',
              line1: 'Tímto přidáte výše vybraný soubor.',
              line2: 'Prosím potvrďte.'
            },
            image: {
              title: 'Přidat tento obrázek?',
              change: 'Zrušit'
            },
            crop: {
              title: 'Oříznout a přidat tento obrázek',
              done: 'Hotovo',
              free: 'zdarma'
            },
            error: {
              "default": {
                title: 'Jejda!',
                text: 'Něco se v průběhu nahrávání nepodařilo.',
                back: 'Zkuste to prosím znovu.'
              },
              image: {
                title: 'Lze nahrávat pouze obrázky.',
                text: 'Zkuste to prosím s jiným souborem.',
                back: 'Vyberte obrázek'
              },
              size: {
                title: 'Soubor přesahuje povolenou velikost.',
                text: 'Prosím zkuste to s jiným souborem.'
              },
              loadImage: {
                title: 'Chyba',
                text: 'Nelze nahrát obrázek'
              }
            },
            multiple: {
              title: 'Bylo vybráno %files% souborů',
              question: 'Chcete přidat všechny tyto soubory?',
              tooManyFiles: 'Bylo vybráno moc souborů. Maximum je %max%',
              tooFewFiles: 'Bylo vybráno %files% souborů. Musíte vybrat minimálně %min%',
              clear: 'Odstranit vše',
              done: 'Hotovo'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.cs = function(n) {
      if (n === 1) {
        return 'one';
      } else if ((2 <= n && n <= 4)) {
        return 'few';
      } else {
        return 'many';
      }
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.da = {
      uploading: 'Uploader... Vent venligst.',
      loadingInfo: 'Henter information...',
      errors: {
        "default": 'Fejl',
        baddata: 'Forkert værdi',
        size: 'Filen er for stor',
        upload: 'Kan ikke uploade / sende fil',
        user: 'Upload fortrudt',
        info: 'Kan ikke hente information',
        image: 'Kun billeder er tilladt',
        createGroup: 'Kan ikke oprette fil gruppe',
        deleted: 'Filen blev slettet'
      },
      draghere: 'Drop en fil her',
      file: {
        one: '%1 fil',
        other: '%1 filer'
      },
      buttons: {
        cancel: 'Annuller',
        remove: 'Fjern',
        choose: {
          files: {
            one: 'Vælg en fil',
            other: 'Vælg filer'
          },
          images: {
            one: 'Vælg et billede',
            other: 'Vælg billeder'
          }
        }
      },
      dialog: {
        done: 'Færdig',
        showFiles: 'Vis filer',
        tabs: {
          names: {
            preview: 'Vis',
            file: 'Computer',
            gdrive: 'Google Drev',
            url: 'Direkte link'
          },
          file: {
            drag: 'Drop en fil her',
            nodrop: 'Hent filer fra din computer',
            or: 'eller',
            button: 'Hent fil fra din computer',
            also: 'Du kan også hente fra'
          },
          url: {
            title: 'Filer fra en Web adresse',
            line1: 'Vælg en fil fra en web adresse.',
            line2: 'Skriv bare linket til filen.',
            input: 'Indsæt link her...',
            button: 'Upload / Send'
          },
          preview: {
            unknownName: 'ukendt',
            change: 'Annuller',
            back: 'Tilbage',
            done: 'Fortsæt',
            unknown: {
              title: 'Uploader / sender... Vent for at se mere.',
              done: 'Fortsæt uden at vente på resultat'
            },
            regular: {
              title: 'Tilføje fil?',
              line1: 'Du er ved at tilføje filen ovenfor.',
              line2: 'Venligst accepter.'
            },
            image: {
              title: 'Tilføj billede?',
              change: 'Annuller'
            },
            crop: {
              title: 'Beskær og tilføj dette billede',
              done: 'Udfør'
            },
            error: {
              "default": {
                title: 'Hov!',
                text: 'Noget gik galt under upload.',
                back: 'Venligst prøv igen'
              },
              image: {
                title: 'Du kan kun vælge billeder.',
                text: 'Prøv igen med en billedfil.',
                back: 'Vælg billede'
              },
              size: {
                title: 'Den fil du valgte, er desværre større end tilladt.',
                text: 'Venligst prøv med en mindre fil.'
              },
              loadImage: {
                title: 'Fejl',
                text: 'Kan ikke åbne billede'
              }
            },
            multiple: {
              title: 'Du har valgt %files% filer',
              question: 'Vil du tilføje alle disse filer?',
              tooManyFiles: 'Du har valgt for mange filer. %max% er maximum.',
              tooFewFiles: 'Du har valgt %files% filer. Men du skal vælge mindst %min%.',
              clear: 'Fjern alle',
              done: 'Fortsæt'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.da = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.de = {
      uploading: 'Hochladen... Bitte warten.',
      loadingInfo: 'Laden der Informationen...',
      errors: {
        "default": 'Error',
        baddata: 'Falscher Wert',
        size: 'Datei zu groß',
        upload: 'Kann nicht hochgeladen werden',
        user: 'Hochladen abgebrochen',
        info: 'Informationen können nicht geladen werden',
        image: 'Nur Bilder sind erlaubt',
        createGroup: 'Datei-Gruppe kann nicht erstellt werden',
        deleted: 'Datei wurde gelöscht'
      },
      draghere: 'Ziehen Sie eine Datei hier hinein',
      file: {
        one: '%1 Datei',
        other: '%1 Dateien'
      },
      buttons: {
        cancel: 'Abbrechen',
        remove: 'Löschen',
        choose: {
          files: {
            one: 'Wählen Sie eine Datei',
            other: 'Wählen Sie die Dateien'
          },
          images: {
            one: 'Wählen Sie ein Bild',
            other: 'Wählen Sie Bilder'
          }
        }
      },
      dialog: {
        done: 'Fertig',
        showFiles: 'Dateien anzeigen',
        tabs: {
          names: {
            'empty-pubkey': 'Willkommen',
            preview: 'Vorschau',
            file: 'Lokale Dateien',
            url: 'Web-Links',
            camera: 'Kamera'
          },
          file: {
            drag: 'Ziehen Sie eine Datei hier hinein',
            nodrop: 'Laden Sie Dateien von Ihrem PC hoch',
            cloudsTip: 'Cloud Speicher<br>und soziale Dienste',
            or: 'oder',
            button: 'Wählen Sie eine lokale Datei',
            also: 'Sie können sie auch wählen von'
          },
          url: {
            title: 'Dateien vom Web',
            line1: 'Holen Sie sich irgendeine Datei vom Web.',
            line2: 'Geben Sie einfach den Link an.',
            input: 'Bitte geben Sie den Link hier an...',
            button: 'Hochladen'
          },
          camera: {
            capture: 'Machen Sie ein Foto',
            mirror: 'Spiegel',
            retry: 'Berechtigungen erneut anfordern',
            pleaseAllow: {
              title: 'Bitte erlauben Sie den Zugriff auf Ihre Kamera',
              text: 'Sie wurden gebeten, dieser Website den Zugriff auf Ihre Kamera zu erlauben. Um mit Ihrer Kamera Fotos machen zu können, müssen Sie diese Erlaubnis erteilen.'
            },
            notFound: {
              title: 'Keine Kamera festgestellt',
              text: 'Es sieht so aus, als hätten Sie keine Kamera an dieses Gerät angeschlossen.'
            }
          },
          preview: {
            unknownName: 'nicht bekannt',
            change: 'Abbrechen',
            back: 'Zurück',
            done: 'Hinzufügen',
            unknown: {
              title: 'Hochladen... Bitte warten Sie auf die Vorschau.',
              done: 'Vorschau überspringen und Datei annehmen'
            },
            regular: {
              title: 'Diese Datei hinzufügen?',
              line1: 'Diese Datei wird nun hinzugefügt.',
              line2: 'Bitte bestätigen Sie.'
            },
            image: {
              title: 'Dieses Bild hinzufügen?',
              change: 'Abbrechen'
            },
            crop: {
              title: 'Dieses Bild beschneiden und hinzufügen',
              done: 'Fertig',
              free: 'frei'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Etwas ist während dem Hochladen schief gelaufen.',
                back: 'Bitte versuchen Sie es erneut'
              },
              image: {
                title: 'Nur Bilder sind akzeptiert.',
                text: 'Bitte veruschen Sie es erneut mit einer anderen Datei.',
                back: 'Bild wählen'
              },
              size: {
                title: 'Die gewählte Datei überschreitet das Limit.',
                text: 'Bitte veruschen Sie es erneut mit einer anderen Datei.'
              },
              loadImage: {
                title: 'Fehler',
                text: 'Das Bild kann nicht geladen werden'
              }
            },
            multiple: {
              title: 'Sie haben %files% Dateien gewählt',
              question: 'Möchten Sie all diese Datein hinzufügen?',
              tooManyFiles: 'Sie haben zu viele Dateien gewählt. %max% ist das Maximum.',
              tooFewFiles: 'Sie haben %files% Dateien. Es sind mindestens %min% nötig.',
              clear: 'Alle löschen',
              done: 'Fertig'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.de = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.es = {
      uploading: 'Subiendo... Por favor espere.',
      loadingInfo: 'Cargando información...',
      errors: {
        "default": 'Error',
        baddata: 'Valor incorrecto',
        size: 'Archivo demasiado grande',
        upload: 'No se puede subir',
        user: 'Subida cancelada',
        info: 'No se puede cargar la información',
        image: 'Solo se permiten imágenes',
        createGroup: 'No se puede crear el grupo de archivos',
        deleted: 'El archivo fue eliminado'
      },
      draghere: 'Arrastra un archivo aquí',
      file: {
        one: '%1 archivo',
        other: '%1 archivos'
      },
      buttons: {
        cancel: 'Cancelar',
        remove: 'Eliminar',
        choose: {
          files: {
            one: 'Escoge un archivo',
            other: 'Escoge archivos'
          },
          images: {
            one: 'Escoge una imagen',
            other: 'Escoge imágenes'
          }
        }
      },
      dialog: {
        done: 'Hecho',
        showFiles: 'Mostrar archivos',
        tabs: {
          names: {
            'empty-pubkey': 'Bienvenido',
            preview: 'Previsualización',
            file: 'Archivos locales',
            url: 'Enlaces arbitrarios',
            camera: 'Cámara'
          },
          file: {
            drag: 'Arrastra una archivo aquí',
            nodrop: 'Sube fotos desde tu ordenador',
            cloudsTip: 'Almacenamiento en la nube<br>y redes sociales',
            or: 'o',
            button: 'Elige un archivo de tu ordenador',
            also: 'Tambien puedes seleccionarlo de'
          },
          url: {
            title: 'Archivos de la Web',
            line1: 'Coge cualquier archivo de la web.',
            line2: 'Solo danos el link.',
            input: 'Pega tu link aquí...',
            button: 'Subir'
          },
          camera: {
            capture: 'Hacer una foto',
            mirror: 'Espejo',
            retry: 'Solicitar permisos de nuevo',
            pleaseAllow: {
              title: 'Por favor, permite el acceso a tu cámara',
              text: 'Este sitio ha pedido permiso para acceder a la cámara. ' + 'Para tomar imágenes con tu cámara debes aceptar esta petición.'
            },
            notFound: {
              title: 'No se ha detectado ninguna cámara',
              text: 'Parece que no tienes ninguna cámara conectada a este dispositivo.'
            }
          },
          preview: {
            unknownName: 'desconocido',
            change: 'Cancelar',
            back: 'Atrás',
            done: 'Añadir',
            unknown: {
              title: 'Subiendo. Por favor espera para una vista previa.',
              done: 'Saltar vista previa y aceptar'
            },
            regular: {
              title: '¿Quieres subir este archivo?',
              line1: 'Estás a punto de subir el archivo de arriba.',
              line2: 'Confírmalo por favor.'
            },
            image: {
              title: '¿Quieres subir esta imagen?',
              change: 'Cancelar'
            },
            crop: {
              title: 'Cortar y añadir esta imagen',
              done: 'Listo',
              free: 'libre'
            },
            error: {
              "default": {
                title: 'Ups!',
                text: 'Algo salió mal durante la subida.',
                back: 'Por favor, inténtalo de nuevo.'
              },
              image: {
                title: 'Solo se aceptan archivos de imagen.',
                text: 'Por favor, inténtalo de nuevo con otro archivo.',
                back: 'Escoger imagen'
              },
              size: {
                title: 'El archivo que has seleccinado excede el límite.',
                text: 'Por favor, inténtalo de nuevo con otro archivo.'
              },
              loadImage: {
                title: 'Error',
                text: 'No puede cargar la imagen'
              }
            },
            multiple: {
              title: 'Has escogido %files%',
              question: '¿Quieres añadir todos estos archivos?',
              tooManyFiles: 'Has escogido demasiados archivos. %max% es el máximo.',
              tooFewFiles: 'Has escogido %files%. Hacen falta al menos %min%.',
              clear: 'Eliminar todo',
              done: 'Hecho'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.es = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.et = {
      uploading: 'Üleslaadimine… Palun oota.',
      loadingInfo: 'Info laadimine...',
      errors: {
        "default": 'Viga',
        baddata: 'Incorrect value',
        size: 'Fail on liiga suur',
        upload: 'Ei saa üles laadida',
        user: 'Üleslaadimine tühistatud',
        info: 'Ei saa infot laadida',
        image: 'Ainult pildid lubatud',
        createGroup: 'Ei saa luua failigruppi',
        deleted: 'Fail on kustutatud'
      },
      draghere: 'Tiri fail siia',
      file: {
        one: '%1 fail',
        other: '%1 failid'
      },
      buttons: {
        cancel: 'Tühista',
        remove: 'Kustuta',
        choose: {
          files: {
            one: 'Vali fail',
            other: 'Vali failid'
          },
          images: {
            one: 'Vali pilt',
            other: 'Vali pildid'
          }
        }
      },
      dialog: {
        done: 'Valmis',
        showFiles: 'Näita faile',
        tabs: {
          names: {
            'empty-pubkey': 'Tere',
            preview: 'Eelvaade',
            file: 'Failid Kõvakettalt',
            url: 'Veebilink',
            camera: 'Kaamera'
          },
          file: {
            drag: 'Tiri failid siia',
            nodrop: 'Lae failid arvutist',
            cloudsTip: 'Pilv<br>ja sotsiaalmeedia',
            or: 'või',
            button: 'Vali fail kõvakettalt',
            also: 'Saad samuti valida'
          },
          url: {
            title: 'Failid veebist',
            line1: 'Ükskõik mis fail otse veebist.',
            line2: 'Lihtsalt sisesta URL.',
            input: 'Kleebi link siia...',
            button: 'Lae üles'
          },
          camera: {
            capture: 'Take a photo',
            mirror: 'Mirror',
            startRecord: 'Record a video',
            stopRecord: 'Stop',
            cancelRecord: 'Cancel',
            retry: 'Request permissions again',
            pleaseAllow: {
              title: 'Please allow access to your camera',
              text: 'You have been prompted to allow camera access from this site. ' + 'In order to take pictures with your camera you must approve this request.'
            },
            notFound: {
              title: 'No camera detected',
              text: 'Looks like you have no camera connected to this device.'
            }
          },
          preview: {
            unknownName: 'teadmata',
            change: 'Tühista',
            back: 'Tagasi',
            done: 'Lisa',
            unknown: {
              title: 'Üleslaadimine... Palun oota eelvaadet.',
              done: 'Jäta eelvaade vahele ja nõustu'
            },
            regular: {
              title: 'Lisa see fail?',
              line1: 'Oled lisamas ülaltoodud faili.',
              line2: 'Palun kinnita.'
            },
            image: {
              title: 'Lisa pilt?',
              change: 'Tühista'
            },
            crop: {
              title: 'Lõika ja lisa pilt',
              done: 'Valmis',
              free: 'vaba'
            },
            video: {
              title: 'Lisa video?',
              change: 'Tühista'
            },
            error: {
              "default": {
                title: 'Oihh!',
                text: 'Midagi läks üleslaadimisel valesti.',
                back: 'Palun proovi uuesti'
              },
              image: {
                title: 'Ainult pildifailid on lubatud.',
                text: 'Palun proovi uuesti teise failiga.',
                back: 'Vali pilt'
              },
              size: {
                title: 'Valitud fail ületab maksimaalse suuruse.',
                text: 'Palun proovi uuesti teise failiga.'
              },
              loadImage: {
                title: 'Viga',
                text: 'Ei saa pilti laadida'
              }
            },
            multiple: {
              title: 'Oled valinud %files%',
              question: 'Kas sa soovid lisada kõik failid?',
              tooManyFiles: 'Oled valinud liiga suure hulga faile. %max% on maksimaalne.',
              tooFewFiles: 'Oled valinud %files%. Vähemalt %min% nõutud.',
              clear: 'Eemalda kõik',
              done: 'Valmis'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.et = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.fr = {
      uploading: 'Envoi en cours... Merci de patientier.',
      loadingInfo: 'Chargement des informations...',
      errors: {
        "default": 'Erreur',
        baddata: 'Valeur incorrecte',
        size: 'Fichier trop volumineux',
        upload: 'Envoi impossible',
        user: 'Envoi annulé',
        info: 'Impossible de charger les informations',
        image: 'Seules les images sont autorisées',
        createGroup: 'Création d\'1 groupe impossible',
        deleted: 'Le fichier a été supprimé'
      },
      draghere: 'Glissez-déposez un fichier ici',
      file: {
        one: '%1 fichier',
        other: '%1 fichiers'
      },
      buttons: {
        cancel: 'Annuler',
        remove: 'Supprimer',
        choose: {
          files: {
            one: 'Sélectionner un fichier',
            other: 'Sélectionner des fichiers'
          },
          images: {
            one: 'Sélectionner une image',
            other: 'Sélectionner des images'
          }
        }
      },
      dialog: {
        done: 'Terminer',
        showFiles: 'Voir les fichiers',
        tabs: {
          names: {
            preview: 'Avant-première',
            file: 'Fichier en local',
            url: 'Une adresse web',
            'empty-pubkey': 'Bienvenue',
            camera: 'Appareil photo'
          },
          file: {
            drag: 'Glissez-déposez un fichier ici',
            nodrop: 'Envoyez des fichiers depuis votre ordinateur',
            cloudsTip: 'Stockage sur le cloud<br>et réseaux sociaux',
            or: 'ou',
            button: 'Choisir un fichier local',
            also: 'Vous pouvez également le sélectionner depuis'
          },
          url: {
            title: 'Fichiers depuis le Web',
            line1: 'Prenez n\'importe quel fichier depuis un site web.',
            line2: 'Saisissez simplement son adresse.',
            input: 'Collez le lien ici...',
            button: 'Envoi'
          },
          camera: {
            capture: 'Prendre une photo',
            mirror: 'Miroir',
            retry: 'Envoyer une nouvelle demande de permission',
            pleaseAllow: {
              title: 'Autorisez l\'accès à votre appareil photo',
              text: 'Vous avez été invité à autoriser l\'accès à votre appareil photo. Pour prendre des photos avec votre appareil photo vous devez approuver cette demande.'
            },
            notFound: {
              title: 'Aucun appareil photo détecté',
              text: 'Il semblerait que vous n\'ayez pas d\'appareil photo connecté à cet appareil.'
            }
          },
          preview: {
            unknownName: 'inconnu',
            change: 'Annuler',
            back: 'Retour',
            done: 'Ajouter',
            unknown: {
              title: 'Envoi en cours... Merci de patientier pour prévisualiser.',
              done: 'Passer la prévisualisation et accepter'
            },
            regular: {
              title: 'Ajouter ce fichier ?',
              line1: 'Vous êtes sur le point d\'ajouter le fichier ci-dessus.',
              line2: 'Merci de confirmer.'
            },
            image: {
              title: 'Ajouter cette image ?',
              change: 'Annuler'
            },
            crop: {
              title: 'Recadrer et ajouter cette image',
              done: 'Terminer',
              free: 'libre'
            },
            error: {
              "default": {
                title: 'Oups!',
                text: 'Quelque chose n\'a pas fonctionné pendant l\'envoi.',
                back: 'Merci de bien vouloir recommencer'
              },
              image: {
                title: 'Seules les images sont acceptées.',
                text: 'Merci de bien vouloir recommencer avec un autre fichier.',
                back: 'Choisir une image'
              },
              size: {
                title: 'Le fichier sélectionné est trop volumineux.',
                text: 'Merci de bien vouloir recommencer avec un autre fichier.'
              },
              loadImage: {
                title: 'Erreur',
                text: 'Impossible de charger l\'image'
              }
            },
            multiple: {
              title: 'Vous avez choisi %files%',
              question: 'Voulez vous ajouter tous ces fichiers ?',
              clear: 'Tout retirer',
              done: 'Terminer',
              tooManyFiles: 'Vous avez choisi trop de fichiers. %max% est le maximum.',
              tooFewFiles: 'Vous avez choisi %fichiers%. %min% est le minimum.'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.fr = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.he = {
      uploading: 'טוען... אנא המתן.',
      loadingInfo: 'טוען מידע...',
      errors: {
        "default": 'שגיאה',
        baddata: 'ערך שגוי',
        size: 'קובץ גדול מידי',
        upload: 'לא ניתן להעלות',
        user: 'העלאה בוטלה',
        info: 'לא ניתן לטעון מידע',
        image: 'ניתן להעלות רק תמונות',
        createGroup: 'לא ניתן ליצור קבוצה',
        deleted: 'הקובץ נמחק'
      },
      draghere: 'שחרר כאן קובץ',
      file: {
        one: 'קובץ %1',
        other: '%1 קבצים'
      },
      buttons: {
        cancel: 'ביטול',
        remove: 'הסר',
        choose: {
          files: {
            one: 'בחר קובץ',
            other: 'בחר קבצים'
          },
          images: {
            one: 'בחר תמונה',
            other: 'בחר תמונות'
          }
        }
      },
      dialog: {
        done: 'סיום',
        showFiles: 'הצג קבצים',
        tabs: {
          names: {
            facebook: 'פייסבוק',
            dropbox: 'דרופבוקס',
            gdrive: 'כונן גוגל',
            instagram: 'אינסטגרם',
            url: 'לינק מהאינטרנט'
          },
          file: {
            drag: 'שחרר כאן קובץ',
            nodrop: 'העלה קבצים מהמחשב',
            or: 'או',
            button: 'בחר קובץ מהמחשב',
            also: 'ניתן לבחור גם מ'
          },
          url: {
            title: 'קובץ מהאינטרנט',
            line1: 'גרור קובץ מהאינטרנט',
            line2: 'ספק את כתובת הקובץ',
            input: 'הדבק את כתובת הקובץ...',
            button: 'העלה'
          },
          preview: {
            unknownName: 'לא ידוע',
            change: 'ביטול',
            back: 'חזרה',
            done: 'הוסף',
            unknown: {
              title: 'מעלה... נא המתן לתצוגה מקדימה.',
              done: 'דלג על תצוגה מקדימה'
            },
            regular: {
              title: 'להוסיף קובץ זה?',
              line1: 'קובץ זה יועלה',
              line2: 'נא אשר.'
            },
            image: {
              title: 'להוסיף תמונה זו?',
              change: 'ביטול'
            },
            crop: {
              title: 'חתוך והוסף תמונה זו',
              done: 'סיום'
            },
            error: {
              "default": {
                title: 'אופס!',
                text: 'משהו השתבש בזמן ההעלאה.',
                back: 'נא נסה שוב'
              },
              image: {
                title: 'ניתן לקבל רק קבצי תמונות.',
                text: 'נא נסה שוב עם קובץ אחר.',
                back: 'בחר תמונה'
              },
              size: {
                title: 'הקובץ שבחרת חורג מהגבול.',
                text: 'נא נסה שוב עם קובץ אחר.'
              },
              loadImage: {
                title: 'שגיאה',
                text: 'טעינת התמונה נכשלה'
              }
            },
            multiple: {
              title: 'בחרת %files%',
              question: 'אתה מעוניין להוסיף את כל הקבצים האלו?',
              tooManyFiles: 'בחרת יותר מידי קבצים. יש לבחור מקסימום %max% קבצים.',
              tooFewFiles: 'בחרת %files%. יש לבחור לפחות %min%.',
              clear: 'הסר הכל',
              done: 'סיום'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.he = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.it = {
      uploading: 'Caricamento in corso... Si prega di attendere.',
      loadingInfo: 'Caricamento informazioni in corso...',
      errors: {
        "default": 'Errore',
        baddata: 'Valore errato',
        size: 'Il file è troppo grande',
        upload: 'Impossibile fare l’upload',
        user: 'Upload cancellato',
        info: 'Impossibile caricare le informazioni',
        image: 'Sono ammesse solo immagini',
        createGroup: 'Impossibile creare gruppo di file',
        deleted: 'Il file è stato eliminato'
      },
      draghere: 'Trascina un file qui',
      file: {
        one: 'file %1',
        other: 'file %1'
      },
      buttons: {
        cancel: 'Cancella',
        remove: 'Rimuovi',
        choose: {
          files: {
            one: 'Seleziona un file',
            other: 'Seleziona file'
          },
          images: {
            one: 'Seleziona un’immagine',
            other: 'Seleziona immagini'
          }
        }
      },
      dialog: {
        done: 'Fatto',
        showFiles: 'Mostra file',
        tabs: {
          names: {
            'empty-pubkey': 'Benvenuto',
            preview: 'Anteprima',
            file: 'File locali',
            url: 'Link arbitrari',
            camera: 'Fotocamera'
          },
          file: {
            drag: 'Trascina un file qui',
            nodrop: 'Carica file dal tuo computer',
            cloudsTip: 'Salvataggi nel cloud<br>e servizi sociali',
            or: 'o',
            button: 'Seleziona un file locale',
            also: 'Puoi anche scegliere da'
          },
          url: {
            title: 'File dal web',
            line1: 'Preleva un file dal web.',
            line2: 'È sufficiente fornire il link.',
            input: 'Incolla il tuo link qui...',
            button: 'Carica'
          },
          camera: {
            capture: 'Scatta una foto',
            mirror: 'Specchio',
            retry: 'Richiedi di nuovo le autorizzazioni',
            pleaseAllow: {
              title: 'Consenti l’accesso alla tua fotocamera',
              text: 'Ti è stato richiesto di consentire l’accesso alla fotocamera da questo sito. Per scattare le foto con la tua fotocamera devi accettare questa richiesta.'
            },
            notFound: {
              title: 'Nessuna fotocamera rilevata',
              text: 'Non risulta che tu non abbia una fotocamera collegata a questo dispositivo.'
            }
          },
          preview: {
            unknownName: 'sconosciuto',
            change: 'Cancella',
            back: 'Indietro',
            done: 'Aggiungi',
            unknown: {
              title: 'Caricamento in corso... Attendi l’anteprima.',
              done: 'Salta l’anteprima e accetta'
            },
            regular: {
              title: 'Vuoi aggiungere questo file?',
              line1: 'Stai per aggiungere il file sopra.',
              line2: 'Conferma.'
            },
            image: {
              title: 'Vuoi aggiungere questa immagine?',
              change: 'Cancella'
            },
            crop: {
              title: 'Ritaglia e aggiungi questa immagine',
              done: 'Fatto',
              free: 'gratis'
            },
            error: {
              "default": {
                title: 'Ops!',
                text: 'Si è verificato un problema durante l’upload.',
                back: 'Si prega di riprovare'
              },
              image: {
                title: 'Sono accettati solo file immagine.',
                text: 'Riprova con un altro file.',
                back: 'Scegli immagine'
              },
              size: {
                title: 'Il file selezionato supera il limite.',
                text: 'Riprova con un altro file.'
              },
              loadImage: {
                title: 'Errore',
                text: 'Impossibile caricare l’immagine'
              }
            },
            multiple: {
              title: 'Hai selezionato %files%',
              question: 'Vuoi aggiungere tutti questi file?',
              tooManyFiles: 'Hai selezionato troppi file. %max% è il massimo.',
              tooFewFiles: 'Hai selezionato %files%. È richiesto almeno %min%.',
              clear: 'Rimuovi tutto',
              done: 'Fatto'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.it = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.ja = {
      uploading: 'アップロードしています… 完了までお待ち下さい。',
      loadingInfo: '読み込み中…',
      errors: {
        "default": 'エラー',
        baddata: '間違った値',
        size: 'ファイルが大きすぎます',
        upload: 'アップロードできませんでした',
        user: 'アップロードがキャンセルされました',
        info: '読み込みに失敗しました',
        image: 'アップロードできるのは画像ファイルのみです',
        createGroup: 'グループの作成に失敗しました',
        deleted: '削除されたファイルです'
      },
      draghere: 'ここにファイルをドロップ',
      file: {
        other: '%1ファイル'
      },
      buttons: {
        cancel: 'キャンセル',
        remove: '削除',
        choose: {
          files: {
            one: 'ファイルを選択',
            other: 'ファイルを選択'
          },
          images: {
            one: '画像を選択',
            other: '画像を選択'
          }
        }
      },
      dialog: {
        done: '完了',
        showFiles: 'ファイルを表示',
        tabs: {
          names: {
            preview: 'プレビュー',
            file: 'ローカルファイル',
            url: 'URLを直接入力'
          },
          file: {
            drag: 'ここにファイルをドロップ',
            nodrop: 'ファイルを選択してアップロード',
            cloudsTip: 'クラウドストレージ<br>およびソーシャルサービス',
            or: 'もしくは',
            button: 'ローカルのファイルを選択',
            also: '次からも選択可能です：'
          },
          url: {
            title: 'ウェブ上のファイル',
            line1: 'ウェブ上からファイルを取得します。',
            line2: 'URLを入力してください。',
            input: 'ここにURLを貼り付けしてください…',
            button: 'アップロード'
          },
          preview: {
            unknownName: '不明なファイル',
            change: 'キャンセル',
            back: '戻る',
            done: '追加',
            unknown: {
              title: 'アップロードしています… プレビューの表示をお待ちください。',
              done: 'プレビューの確認をスキップして完了'
            },
            regular: {
              title: 'このファイルを追加しますか？',
              line1: 'こちらのファイルを追加しようとしています。',
              line2: '確認してください。'
            },
            image: {
              title: 'この画像を追加しますか？',
              change: 'キャンセル'
            },
            crop: {
              title: '画像の切り取りと追加',
              done: '完了',
              free: 'リセット'
            },
            error: {
              "default": {
                title: '失敗しました',
                text: 'アップロード中に不明なエラーが発生しました。',
                back: 'もう一度お試し下さい'
              },
              image: {
                title: '画像ファイルのみ許可されています',
                text: '他のファイルで再度お試し下さい。',
                back: '画像を選択'
              },
              size: {
                title: 'ファイルサイズが大きすぎます。',
                text: '他のファイルで再度お試し下さい。'
              },
              loadImage: {
                title: 'エラー',
                text: '画像のロードに失敗しました。'
              }
            },
            multiple: {
              title: '%files%つのファイルを選択中',
              question: 'これら全てのファイルを追加しますか？',
              tooManyFiles: '選択ファイルが多すぎます。%max%つ以下にしてください。',
              tooFewFiles: '選択ファイルが少なすぎます。%files%つ選択中です。少なくとも%min%つ選択してください。',
              clear: '全て削除',
              done: '完了'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.ja = function(n) {
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.lv = {
      uploading: 'Augšupielādē... Lūdzu, gaidiet.',
      errors: {
        "default": 'Kļūda',
        image: 'Atļauti tikai attēli'
      },
      draghere: 'Velciet failus šeit',
      file: {
        zero: '%1 failu',
        one: '%1 fails',
        other: '%1 faili'
      },
      buttons: {
        cancel: 'Atcelt',
        remove: 'Dzēst'
      },
      dialog: {
        title: 'Ielādēt jebko no jebkurienes',
        poweredby: 'Darbināts ar',
        support: {
          images: 'Attēli',
          audio: 'Audio',
          video: 'Video',
          documents: 'Dokumenti'
        },
        tabs: {
          file: {
            title: 'Mans dators',
            line1: 'Paņemiet jebkuru failu no jūsu datora.',
            line2: 'Izvēlēties ar dialogu vai ievelciet iekšā.',
            button: 'Meklēt failus'
          },
          url: {
            title: 'Faili no tīmekļa',
            line1: 'Paņemiet jebkuru failu no tīmekļa.',
            line2: 'Tikai uzrādiet linku.',
            input: 'Ielīmējiet linku šeit...',
            button: 'Ielādēt'
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.lv = function(n) {
      if (n === 0) {
        return 'zero';
      }
      if ((n % 10 === 1) && (n % 100 !== 11)) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.nb = {
      uploading: 'Laster opp... Vennligst vent.',
      loadingInfo: 'Laster inn info...',
      errors: {
        "default": 'Feil',
        baddata: 'Ugyldig verdi',
        size: 'Filen er for stor',
        upload: 'Kan ikke laste opp',
        user: 'Opplasting avbrutt',
        info: 'Kan ikke laste inn info',
        image: 'Kun bilder er tillatt',
        createGroup: 'Kan ikke opprette filgruppe',
        deleted: 'Filen er slettet'
      },
      draghere: 'Dra en fil hit',
      file: {
        one: '%1 fil',
        other: '%1 filer'
      },
      buttons: {
        cancel: 'Avbryt',
        remove: 'Fjern',
        choose: {
          files: {
            one: 'Velg en fil',
            other: 'Velg filer'
          },
          images: {
            one: 'Velg et bilde',
            other: 'Velg bilder'
          }
        }
      },
      dialog: {
        done: 'Ferdig',
        showFiles: 'Vis filer',
        tabs: {
          names: {
            preview: 'Forhåndsvising',
            file: 'Lokale filer',
            url: 'Direktelink'
          },
          file: {
            drag: 'Dra og slipp en fil her',
            nodrop: 'Last opp filer fra datamaskinen',
            cloudsTip: 'Skylagring<br>og sosiale tjenester',
            or: 'eller',
            button: 'Velg en lokal fil',
            also: 'Du kan også velge det fra'
          },
          url: {
            title: 'Filer fra internett',
            line1: 'Velg hvilken som helst fil fra internett.',
            line2: 'Bare gi oss linken.',
            input: 'Lim inn linken her...',
            button: 'Last opp'
          },
          preview: {
            unknownName: 'ukjent',
            change: 'Avbryt',
            back: 'Tilbake',
            done: 'Legg til',
            unknown: {
              title: 'Laster opp... Vennligst vent på forhåndsvisning.',
              done: 'Hopp over forhåndsvisning og godkjenn'
            },
            regular: {
              title: 'Legge til denne filen?',
              line1: 'Filen legges nå til.',
              line2: 'Vennligst bekreft.'
            },
            image: {
              title: 'Legge til dette bildet?',
              change: 'Avbryt'
            },
            crop: {
              title: 'Kutt og legg til dette bildet',
              done: 'Ferdig',
              free: 'frigjør'
            },
            error: {
              "default": {
                title: 'Ops!',
                text: 'Noe gikk galt under opplastingen.',
                back: 'Vennligst prøv igjen'
              },
              image: {
                title: 'Kun bilder er akseptert.',
                text: 'Prøv igjen med en annen fil.',
                back: 'Velg bilde'
              },
              size: {
                title: 'Den valgte filen overskrider tilatt størrelse.',
                text: 'Vennligst prøv igjen med en annen fil.'
              },
              loadImage: {
                title: 'Feil',
                text: 'Kan ikke laste bildet'
              }
            },
            multiple: {
              title: 'Du har valgt %files%',
              question: 'Ønsker du å legge til alle filene?',
              tooManyFiles: 'Du har valgt for mange filer. %max% er maksimum.',
              tooFewFiles: 'Du har valgt %files%. Minimum %min% er påkrevd.',
              clear: 'Fjern alle',
              done: 'Ferdig'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.nb = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.nl = {
      uploading: 'Uploaden... Even geduld.',
      loadingInfo: 'Laden informatie...',
      errors: {
        "default": 'Fout',
        baddata: 'Ongeldige waarde',
        size: 'Bestand is te groot',
        upload: 'Kan niet uploaden',
        user: 'Upload geannulleerd',
        info: 'Kan informatie niet laden',
        image: 'Alleen afbeeldingen toegestaan',
        createGroup: 'Kan bestandsgroep niet maken',
        deleted: 'Bestand is verwijderd'
      },
      draghere: 'Drop hier een bestand',
      file: {
        one: '%1 bestand',
        other: '%1 bestanden'
      },
      buttons: {
        cancel: 'Annuleren',
        remove: 'Verwijderen',
        choose: {
          files: {
            one: 'Kies een bestand',
            other: 'Kies bestanden'
          },
          images: {
            one: 'Kies een afbeelding',
            other: 'Kies afbeeldingen'
          }
        }
      },
      dialog: {
        done: 'Klaar',
        showFiles: 'Toon bestanden',
        tabs: {
          names: {
            preview: 'Voorvertoning',
            file: 'Computer',
            url: 'Directe links'
          },
          file: {
            drag: 'Drop hier een bestand',
            nodrop: 'Upload bestanden van je computer',
            or: 'of',
            button: 'Selecteer een bestand van je computer',
            also: 'Je kan ook selecteren van'
          },
          url: {
            title: 'Bestanden van het web',
            line1: 'Selecteer een bestand van het web.',
            line2: 'Voer de link in.',
            input: 'Plak de link hier...',
            button: 'Upload'
          },
          preview: {
            unknownName: 'onbekend',
            change: 'Annuleren',
            back: 'Terug',
            done: 'Toevoegen',
            unknown: {
              title: 'Uploaden... Wacht op de voorvertoning.',
              done: 'Voorvertoning overslaan an accepteren'
            },
            regular: {
              title: 'Dit bestand toevoegen?',
              line1: 'Je staat op het punt bovenstaand bestand toe te voegen.',
              line2: 'Bevestig.'
            },
            image: {
              title: 'Voeg deze afbeelding toe?',
              change: 'Annuleren'
            },
            crop: {
              title: 'Afbeelding bijknippen en toevoegen',
              done: 'Klaar'
            },
            error: {
              "default": {
                title: 'Oeps!',
                text: 'Er is een fout opgetreden tijdens het uploaden.',
                back: 'Probeer het nog eens'
              },
              image: {
                title: 'Alleen afbeeldingen worden geaccepteerd.',
                text: 'Probeer het nog eens met een andere bestand.',
                back: 'Selecteer afbeelding'
              },
              size: {
                title: 'Het geselecteerd bestand is groter dan de limiet.',
                text: 'Probeer het nog eens met een andere bestand.'
              },
              loadImage: {
                title: 'Fout',
                text: 'Kan afbeelding niet laden'
              }
            },
            multiple: {
              title: 'Je hebt de volgende bestanden geselecteerd %files%',
              question: 'Wil je al deze bestanden toevoegen?',
              tooManyFiles: 'Je hebt teveel bestanden geselecteerd. %max% is het maximum.',
              tooFewFiles: 'Je hebt de volgende bestanden geselecteerd %files%. Minimaal %min% is verplicht.',
              clear: 'Verwijder alle bestanden',
              done: 'Klaar'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.nl = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.pl = {
      uploading: 'Przesyłanie... Proszę czekać.',
      loadingInfo: 'Loading info...',
      errors: {
        "default": 'Błąd',
        baddata: 'Niepoprawna wartość',
        size: 'Plik zbyt duży',
        upload: 'Nie udało się przesłać',
        user: 'Przesyłanie anulowane',
        info: 'Nie udało się załadować informacji',
        image: 'Dozwolone są tylko obrazy',
        createGroup: 'Nie udało się utworzyć grupy plików',
        deleted: 'Plik został usunięty'
      },
      draghere: 'Upuść plik tutaj',
      file: {
        one: '%1 plik',
        few: '%1 pliki',
        many: '%1 plików'
      },
      buttons: {
        cancel: 'Anuluj',
        remove: 'Usuń',
        choose: {
          files: {
            one: 'Wybierz plik',
            other: 'Wybierz pliki'
          },
          images: {
            one: 'Wybierz obraz',
            other: 'Wybierz obrazy'
          }
        }
      },
      dialog: {
        done: 'Wykonano',
        showFiles: 'Pokaż pliki',
        tabs: {
          names: {
            'empty-pubkey': 'Witaj',
            preview: 'Podgląd',
            file: 'Pliki lokalne',
            url: 'Plik z Sieci',
            camera: 'Aparat'
          },
          file: {
            drag: 'Upuść plik tutaj',
            nodrop: 'Prześlij pliki z Twojego komputera',
            cloudsTip: 'Dane w chmurze<br>i sieci społecznościowe',
            or: 'lub',
            button: 'Wybierz plik lokalny',
            also: 'Możesz również wybrać z'
          },
          url: {
            title: 'Pliki z Sieci',
            line1: 'Złap jakikolwiej plik z sieci.',
            line2: 'Podaj adres.',
            input: 'Wklej link...',
            button: 'Prześlij'
          },
          camera: {
            capture: 'Zrób zdjęcie',
            mirror: 'Lustro',
            retry: 'Poproś ponownie o dostęp',
            pleaseAllow: {
              title: 'Prośba o udostępnienie aparatu',
              text: 'Zostałeś poproszony przez tę stronę o dostęp do aparatu. ' + 'Aby robić zdjecia, musisz zaakceptować tę prośbę.'
            },
            notFound: {
              title: 'Nie wykryto aparatu.',
              text: 'Wygląda na to, że nie masz podłączonego aparatu do tego urządzenia.'
            }
          },
          preview: {
            unknownName: 'nieznany',
            change: 'Anuluj',
            back: 'Wstecz',
            done: 'Dodaj',
            unknown: {
              title: 'Przesyłanie... Proszę czekać na podgląd.',
              done: 'Omiń podgląd i zaakceptuj.'
            },
            regular: {
              title: 'Dodać ten plik?',
              line1: 'Zamierzasz dodać nowy plik.',
              line2: 'Potwierdź, proszę.'
            },
            image: {
              title: 'Dodać ten obraz?',
              change: 'Anuluj'
            },
            crop: {
              title: 'Przytnij i dodaj ten obraz',
              done: 'Wykonano',
              free: 'wolny'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Coś poszło nie tak podczas przesyłania.',
                back: 'Spróbuj ponownie'
              },
              image: {
                title: 'Akceptowane są tylko obrazy.',
                text: 'Spróbuj ponownie z innym plikiem.',
                back: 'Wybierz obraz'
              },
              size: {
                title: 'Plik, który wybrałeś, przekracza dopuszczalny rozmiar',
                text: 'Spróbuj ponownie z innym plikiem.'
              },
              loadImage: {
                title: 'Błąd',
                text: 'Nie udało się załadować obrazu'
              }
            },
            multiple: {
              title: 'Wybrałeś %files%',
              question: 'Czy chcesz dodać wszystkie te pliki?',
              tooManyFiles: 'Wybrałeś zbyt wiele plików. Maksimum to %max%.',
              tooFewFiles: 'Wybrałeś %files%. Wymagane jest co najmniej %min%.',
              clear: 'Usuń wszystkie',
              done: 'Wykonano'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.pl = function(n) {
      var _ref;
      if (n === 1) {
        return 'one';
      } else if (((2 <= (_ref = n % 10) && _ref <= 4)) && ((n / 10 % 10 | 0) !== 1)) {
        return 'few';
      } else {
        return 'many';
      }
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.pt = {
      uploading: 'Fazendo upload... Aguarde.',
      loadingInfo: 'Carregando informações...',
      errors: {
        "default": 'Erro',
        baddata: 'Valor incorreto',
        size: 'Arquivo muito grande',
        upload: 'Não foi possível fazer o upload',
        user: 'Upload cancelado',
        info: 'Não foi possível carregar as informações',
        image: 'Apenas imagens são permitidas',
        createGroup: 'Não foi possível criar o grupo de arquivos',
        deleted: 'O arquivo foi excluído'
      },
      draghere: 'Arraste um arquivo para cá',
      file: {
        one: '%1 arquivo',
        other: '%1 arquivos'
      },
      buttons: {
        cancel: 'Cancelar',
        remove: 'Excluir',
        choose: {
          files: {
            one: 'Escolha um arquivo',
            other: 'Escolha arquivos'
          },
          images: {
            one: 'Escolha um imagem',
            other: 'Escolha imagens'
          }
        }
      },
      dialog: {
        done: 'OK',
        showFiles: 'Mostrar arquivos',
        tabs: {
          names: {
            preview: 'Pré-estréia',
            file: 'Computador',
            url: 'Link da web'
          },
          file: {
            drag: 'Arraste um arquivo para cá',
            nodrop: 'Faça upload de arquivos do seu computador',
            or: 'ou',
            button: 'Escolha um arquivo do computador',
            also: 'Você também pode escolher arquivos de'
          },
          url: {
            title: 'Arquivos da web',
            line1: 'Faça upload de qualquer arquivo da web.',
            line2: 'Apenas informe o link.',
            input: 'Cole seu link aqui...',
            button: 'Upload'
          },
          preview: {
            unknownName: 'desconhecido',
            change: 'Cancelar',
            back: 'Voltar',
            done: 'Adicionar',
            unknown: {
              title: 'Fazendo upload... Aguarde o preview.',
              done: 'Pular preview e aceitar'
            },
            regular: {
              title: 'Adicionar esse arquivo?',
              line1: 'Você está prestes a adicionar o arquivo acima.',
              line2: 'Por favor, confirme.'
            },
            image: {
              title: 'Adicionar essa imagem?',
              change: 'Cancelar'
            },
            crop: {
              title: 'Cortar e adicionar essa imagem',
              done: 'OK',
              free: 'livre'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Alguma coisa deu errado durante o upload.',
                back: 'Por favor, tente novamente'
              },
              image: {
                title: 'Apenas arquivos de imagem são aceitos.',
                text: 'Por favor, tente novamente com outro arquivo.',
                back: 'Escolher a imagem'
              },
              size: {
                title: 'O arquivo que você escolheu excede o limite.',
                text: 'Por favor, tente novamente com outro arquivo.'
              },
              loadImage: {
                title: 'Erro',
                text: 'Não foi possível carregar a imagem'
              }
            },
            multiple: {
              title: 'Você escolheu',
              question: 'Você quer adicionar todos esses arquivos?',
              clear: 'Excluir todos',
              done: 'OK'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.pt = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.ru = {
      uploading: 'Идет загрузка',
      loadingInfo: 'Загрузка информации...',
      errors: {
        "default": 'Ошибка',
        baddata: 'Некорректные данные',
        size: 'Слишком большой файл',
        upload: 'Ошибка при загрузке',
        user: 'Загрузка прервана',
        info: 'Ошибка при загрузке информации',
        image: 'Разрешены только изображения',
        createGroup: 'Не удалось создать группу файлов',
        deleted: 'Файл удалён'
      },
      draghere: 'Перетащите файл сюда',
      file: {
        one: '%1 файл',
        few: '%1 файла',
        many: '%1 файлов'
      },
      buttons: {
        cancel: 'Отмена',
        remove: 'Удалить',
        choose: {
          files: {
            one: 'Выбрать файл',
            other: 'Выбрать файлы'
          },
          images: {
            one: 'Выбрать изображение',
            other: 'Выбрать изображения'
          }
        }
      },
      dialog: {
        done: 'Готово',
        showFiles: 'Показать файлы',
        tabs: {
          names: {
            preview: 'Предпросмотр',
            'empty-pubkey': 'Приветствие',
            file: 'Локальные файлы',
            vk: 'ВКонтакте',
            url: 'Произвольная ссылка',
            camera: 'Камера'
          },
          file: {
            drag: 'Перетащите файл сюда',
            nodrop: 'Загрузка файлов с вашего компьютера',
            cloudsTip: 'Облачные хранилища<br>и социальные сети',
            or: 'или',
            button: 'Выберите локальный файл',
            also: 'Вы также можете загрузить файлы, используя:'
          },
          url: {
            title: 'Файлы с других сайтов',
            line1: 'Загрузите любой файл из сети.',
            line2: '',
            input: 'Укажите здесь ссылку...',
            button: 'Загрузить'
          },
          camera: {
            capture: 'Сделать снимок',
            mirror: 'Отразить',
            retry: 'Повторно запросить разрешение',
            pleaseAllow: {
              title: 'Пожалуйста, разрешите доступ к камере',
              text: 'Для того, чтобы сделать снимок, мы запросили разрешение ' + 'на доступ к камере с этого сайта.'
            },
            notFound: {
              title: 'Камера не найдена',
              text: 'Скорее всего камера не подключена или не настроена.'
            }
          },
          preview: {
            unknownName: 'неизвестно',
            change: 'Отмена',
            back: 'Назад',
            done: 'Добавить',
            unknown: {
              title: 'Загрузка... Пожалуйста подождите.',
              done: 'Пропустить предварительный просмотр'
            },
            regular: {
              title: 'Загрузить этот файл?',
              line1: 'Вы собираетесь добавить этот файл:',
              line2: 'Пожалуйста, подтвердите.'
            },
            image: {
              title: 'Добавить это изображение?',
              change: 'Отмена'
            },
            video: {
              title: 'Добавить это видео?',
              change: 'Отмена'
            },
            crop: {
              title: 'Обрезать и добавить это изображение',
              done: 'Готово',
              free: 'произв.'
            },
            error: {
              "default": {
                title: 'Ой!',
                text: 'Что-то пошло не так во время загрузки.',
                back: 'Пожалуйста, попробуйте ещё раз'
              },
              image: {
                title: 'Можно загружать только изображения.',
                text: 'Попробуйте загрузить другой файл.',
                back: 'Выберите изображение'
              },
              size: {
                title: 'Размер выбранного файла превышает лимит.',
                text: 'Попробуйте загрузить другой файл.'
              },
              loadImage: {
                title: 'Ошибка',
                text: 'Изображение не удалось загрузить'
              }
            },
            multiple: {
              title: 'Вы выбрали %files%',
              question: 'Вы хотите добавить все эти файлы?',
              tooManyFiles: 'Вы выбрали слишком много файлов. %max% максимум.',
              tooFewFiles: 'Вы выбрали %files%. Нужно не меньше %min%.',
              clear: 'Удалить все',
              done: 'Готово'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.ru = function(n) {
      if (((n / 10 % 10 | 0) === 1) || (n % 10 === 0) || (n % 10 > 4)) {
        return 'many';
      } else if (n % 10 === 1) {
        return 'one';
      } else {
        return 'few';
      }
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.sv = {
      uploading: 'Laddar... Var god vänta.',
      loadingInfo: 'Laddar info...',
      errors: {
        "default": 'Error',
        baddata: 'Felaktigt värde',
        size: 'Filen är för stor',
        upload: 'Kan inte ladda upp',
        user: 'Uppladdning avbruten',
        info: 'Kan inte ladda informationen',
        image: 'Endast bilder tillåtna',
        createGroup: 'Kan inte skapa filgrupp',
        deleted: 'Fil raderad'
      },
      draghere: 'Dra filen hit',
      file: {
        one: '%1 fil',
        other: '%1 filer'
      },
      buttons: {
        cancel: 'Avbryt',
        remove: 'Ta bort',
        choose: {
          files: {
            one: 'Välj fil',
            other: 'Välj filer'
          },
          images: {
            one: 'Välj en fil',
            other: 'Välj filer'
          }
        }
      },
      dialog: {
        done: 'Klar',
        showFiles: 'Visa filer',
        tabs: {
          names: {
            'empty-pubkey': 'Välkommen',
            preview: 'Förhandsgranskning',
            file: 'Lokala filer',
            url: 'Direkta länkar',
            camera: 'Kamera'
          },
          file: {
            drag: 'Släpp en fil hit',
            nodrop: 'Ladda upp filer från din dator',
            cloudsTip: 'Cloud storages<br>och sociala nätverk',
            or: 'eller',
            button: 'Välj en lokal fil',
            also: 'Du kan också välja den från'
          },
          url: {
            title: 'Filer från webben',
            line1: 'Välj en fil från en web adress.',
            line2: 'Agge bara länken til filen.',
            input: 'Klistra in din länk här...',
            button: 'Ladda upp'
          },
          camera: {
            capture: 'Ta ett foto',
            mirror: 'Spegel',
            retry: 'Begär tillstånd igen',
            pleaseAllow: {
              title: 'Vänligen ge tillgång till din kamera',
              text: 'Du har uppmanats att tillåta att denna webbplats får tillgång till din kamera.' + 'För att ta bilder med din kamera måste du godkänna denna begäran.'
            },
            notFound: {
              title: 'Ingen kamera funnen',
              text: 'Det varkar som att du inte har något kamera ansluten till denna enheten.'
            }
          },
          preview: {
            unknownName: 'okänd',
            change: 'Avbryt',
            back: 'Tillbaka',
            done: 'Lägg till',
            unknown: {
              title: 'Laddar... Vänligen vänta på förhandsgranskning.',
              done: 'Skippa förhandsgranskning och acceptera'
            },
            regular: {
              title: 'Lägg till denna filen?',
              line1: 'Du håller på att lägga till filen ovan.',
              line2: 'Vänligen bekräfta.'
            },
            image: {
              title: 'Lägg till denna bilden?',
              change: 'Avbryt'
            },
            crop: {
              title: 'Beskär och lägg till denna bild',
              done: 'Klar',
              free: 'free'
            },
            error: {
              "default": {
                title: 'Oops!',
                text: 'Någonting gick fel under uppladdningen.',
                back: 'Vänligen försök igen'
              },
              image: {
                title: 'Endast bildfiler accepteras.',
                text: 'Vänligen försök igen med en annan fil.',
                back: 'Välj bild'
              },
              size: {
                title: 'Filen du har valt är för stor.',
                text: 'Vänligen försök igen med en annan fil.'
              },
              loadImage: {
                title: 'Error',
                text: 'Kan inte ladda bild'
              }
            },
            multiple: {
              title: 'Du har valt %files%',
              question: 'Vill du lägga till alla dessa filer?',
              tooManyFiles: 'Du har valt för många filer. %max% är max.',
              tooFewFiles: 'Du har valt %files%. Minst %min% krävs.',
              clear: 'Ta bort alla',
              done: 'Klar'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.sv = function(n) {
      if (n === 1) {
        return 'one';
      }
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.tr = {
      uploading: 'Yükleniyor... Lütfen bekleyin.',
      loadingInfo: 'Bilgiler yükleniyor...',
      errors: {
        "default": 'Hata',
        baddata: 'Geçersiz değer',
        size: 'Dosya çok büyük',
        upload: 'Yüklenemedi',
        user: 'Yükleme iptal edildi',
        info: 'Bilgiler getirilemedi',
        image: 'Sadece resim dosyası yüklenebilir',
        createGroup: 'Dosya grubu yaratılamıyor',
        deleted: 'Dosya silinmiş'
      },
      draghere: 'Buraya bir dosya bırakın',
      file: {
        other: '%1 dosya'
      },
      buttons: {
        cancel: 'İptal',
        remove: 'Kaldır',
        choose: {
          files: {
            one: 'Dosya Seçin',
            other: 'Dosya Seçin'
          },
          images: {
            one: 'Resim Dosyası Seçin',
            other: 'Resim Dosyası Seçin'
          }
        }
      },
      dialog: {
        done: 'Bitti',
        showFiles: 'Dosyaları Göster',
        tabs: {
          names: {
            'empty-pubkey': 'Hoş geldiniz',
            preview: 'Önizleme',
            file: 'Bilgisayar',
            url: 'Dış Bağlantılar',
            camera: 'Kamera'
          },
          file: {
            drag: 'Buraya bir dosya bırakın',
            nodrop: 'Bilgisayarınızdan dosya yükleyin',
            or: 'ya da',
            button: 'Bilgisayardan bir dosya seç',
            also: 'Diğer yükleme seçenekleri',
            cloudsTip: 'Bulut depolamalar<br>ve sosyal hizmetler'
          },
          url: {
            title: 'Webden dosyalar',
            line1: 'Webden herhangi bir dosya seçin.',
            line2: 'Dosya bağlantısını sağlayın.',
            input: 'Bağlantınızı buraya yapıştırın...',
            button: 'Yükle'
          },
          camera: {
            capture: 'Fotoğraf çek',
            mirror: 'Ayna',
            retry: 'Tekrar izin iste',
            pleaseAllow: {
              title: 'Lütfen kameranıza erişilmesine izin verin',
              text: 'Bu siteden kamera erişimine izin vermeniz talep ediliyor. Kameranızla fotoğraf çekmek için bu isteği onaylamanız gerekmektedir.'
            },
            notFound: {
              title: 'Kamera algılanamadı',
              text: 'Bu cihaza kamera bağlantısının olmadığı görünüyor.'
            }
          },
          preview: {
            unknownName: 'bilinmeyen',
            change: 'İptal',
            back: 'Geri',
            done: 'Ekle',
            unknown: {
              title: 'Yükleniyor... Önizleme için lütfen bekleyin.',
              done: 'Önizlemeyi geç ve kabul et'
            },
            regular: {
              title: 'Bu dosya eklensin mi?',
              line1: 'Yukarıdaki dosyayı eklemek üzeresiniz.',
              line2: 'Lütfen onaylayın.'
            },
            image: {
              title: 'Bu görsel eklensin mi?',
              change: 'İptal'
            },
            crop: {
              title: 'Bu görseli kes ve ekle',
              done: 'Bitti'
            },
            error: {
              "default": {
                title: 'Aman!',
                text: 'Yükleme sırasında bir hata oluştu.',
                back: 'Lütfen tekrar deneyin.'
              },
              image: {
                title: 'Sadece resim dosyaları kabul edilmektedir.',
                text: 'Lütfen başka bir dosya ile tekrar deneyin.',
                back: 'Resim dosyası seç'
              },
              size: {
                title: 'Seçtiğiniz dosya limitleri aşıyor.',
                text: 'Lütfen başka bir dosya ile tekrar deneyin.'
              },
              loadImage: {
                title: 'Hata',
                text: 'Resim dosyası yüklenemedi'
              }
            },
            multiple: {
              title: '%files% dosya seçtiniz',
              question: 'Bu dosyaların hepsini eklemek istiyor musunuz?',
              tooManyFiles: 'Fazla sayıda dosya seçtiniz, en fazla %max% dosya olabilir.',
              tooFewFiles: '%files% dosya seçtiniz, en az %min% dosya olmalıdır.',
              clear: 'Hepsini kaldır',
              done: 'Bitti'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.tr = function(n) {
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.zhTW = {
      uploading: '上傳中...請等待',
      loadingInfo: '正在讀取資訊...',
      errors: {
        "default": '錯誤',
        baddata: '錯誤資料',
        size: '檔案太大',
        upload: '無法上傳',
        user: '上傳被取消',
        info: '無法讀取資訊',
        image: '只允許圖片檔案',
        createGroup: '無法建立檔案群組',
        deleted: '檔案已被刪除'
      },
      draghere: '拖放檔案到這裡',
      file: {
        other: '%1 個檔案'
      },
      buttons: {
        cancel: '取消',
        remove: '刪除',
        choose: {
          files: {
            one: '選擇檔案',
            other: '選擇檔案'
          },
          images: {
            one: '選擇圖片',
            other: '選擇圖片'
          }
        }
      },
      dialog: {
        done: '完成',
        showFiles: '顯示檔案',
        tabs: {
          names: {
            'empty-pubkey': '歡迎',
            preview: '預覽',
            file: '從本機上傳',
            url: '任意圖片連結',
            camera: '相機'
          },
          file: {
            drag: '拖放檔案到這裡',
            nodrop: '從你的本機中上傳',
            cloudsTip: '雲端硬碟<br>與社群網站',
            or: '或者',
            button: '從本機中選取檔案',
            also: '你也可以選自'
          },
          url: {
            title: '來自網際網路的檔案',
            line1: '從網際網路選取檔案',
            line2: '只需提供連結',
            input: '將連結複製至此...',
            button: '上傳'
          },
          camera: {
            capture: '拍照',
            mirror: '鏡像',
            retry: '重新取得相機權限',
            pleaseAllow: {
              title: '請允許使存取您的相機',
              text: '你一直在提示允許來自這個網站的訪問攝像頭。' + '為了拍照用你的相機，你必須批准這一請求。'
            },
            notFound: {
              title: '沒有找到相機',
              text: '看起來你有沒有將連接相機。'
            }
          },
          preview: {
            unknownName: '未知',
            change: '取消',
            back: '返回',
            done: '加入',
            unknown: {
              title: '上傳中...請等待預覽',
              done: '跳過預覽，直接接受'
            },
            regular: {
              title: '加入這個檔案？',
              line1: '你將加入上面的檔案。',
              line2: '請確認。'
            },
            image: {
              title: '加入這個圖片？',
              change: '取消'
            },
            crop: {
              title: '裁切並加入這個圖片',
              done: '完成',
              free: '自由裁切'
            },
            error: {
              "default": {
                title: '錯誤！',
                text: '上傳過程中出錯。',
                back: '請重試'
              },
              image: {
                title: '只允許上傳圖片檔案。',
                text: '請選擇其他檔案重新上傳。',
                back: '選擇圖片'
              },
              size: {
                title: '你選取的檔案超過了100MB的上限',
                text: '請用另一個檔案再試一次。'
              },
              loadImage: {
                title: '錯誤',
                text: '無法讀取圖片'
              }
            },
            multiple: {
              title: '你已經選擇 %files%',
              question: '你要加入所有檔案嗎？',
              tooManyFiles: '你選了太多的檔案. 最多可選擇%max%. 請刪除一些。',
              tooFewFiles: '你所選擇的檔案 %files%. 至少要 %min% .',
              clear: '清空',
              done: '完成'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.zhTW = function(n) {
      return 'other';
    };
  });

}).call(this);
(function() {
  uploadcare.namespace('locale.translations', function(ns) {
    return ns.zh = {
      uploading: '上传中...请等待',
      loadingInfo: '正在读取信息...',
      errors: {
        "default": '错误',
        baddata: '错误数据',
        size: '文件太大',
        upload: '无法上传',
        user: '上传被取消',
        info: '无法读取信息',
        image: '只允许图形文件',
        createGroup: '无法建立文件组',
        deleted: '文件已被删除'
      },
      draghere: '拖放文件到这里',
      file: {
        other: '%1 个文件'
      },
      buttons: {
        cancel: '取消',
        remove: '删除'
      },
      dialog: {
        done: '完成',
        showFiles: '显示文件',
        tabs: {
          names: {
            url: '任意图片链接'
          },
          file: {
            drag: '拖放文件到这里',
            nodrop: '从你的电脑中上传',
            or: '或者',
            button: '从电脑中选取文件',
            also: '你也可以选自'
          },
          url: {
            title: '来自互联网的文件',
            line1: '从互联网选取文件',
            line2: '只需提供链接',
            input: '将链接拷贝至此...',
            button: '上传'
          },
          preview: {
            unknownName: '未知',
            change: '取消',
            back: '返回',
            done: '添加',
            unknown: {
              title: '上传中...请等待预览',
              done: '跳过预览，直接接受'
            },
            regular: {
              title: '添加这个文件?',
              line1: '你将添加上面的文件。',
              line2: '请确认。'
            },
            image: {
              title: '添加这个图片?',
              change: '取消'
            },
            crop: {
              title: '剪裁并添加这个图片',
              done: '完成'
            },
            error: {
              "default": {
                title: '错误!',
                text: '上传过程中出错。',
                back: '请重试'
              },
              image: {
                title: '只允许上传图片文件。',
                text: '请选择其他文件重新上传。',
                back: '选择图片'
              },
              size: {
                title: '你选取的文件超过了100MB的上限',
                text: '请用另一个文件再试一次。'
              },
              loadImage: {
                title: '错误',
                text: '无法读取图片'
              }
            },
            multiple: {
              title: '你已经选择 %files%',
              question: '你要添加所有文件吗？',
              tooManyFiles: '你选了太多的文件. 最多可选择%max%. 请删除一些。',
              clear: '清空',
              done: '完成'
            }
          }
        }
      }
    };
  });

  uploadcare.namespace('locale.pluralize', function(ns) {
    return ns.zh = function() {
      return 'other';
    };
  });

}).call(this);
(function() {
  var key;

  uploadcare.expose('locales', (function() {
    var _results;
    _results = [];
    for (key in uploadcare.locale.translations) {
      _results.push(key);
    }
    return _results;
  })());

}).call(this);


  return uploadcare.__exports;
}));
