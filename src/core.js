"use strict";
(function(window) {
    function Moon(opts) {
        var _el = opts.el;
        var _data = opts.data;
        var _methods = opts.methods;
        this.$el = document.getElementById(_el);
        this.html = this.$el.innerHTML;
        this.dom = {type: this.$el.nodeName, children: [], node: this.$el};

        Object.defineProperty(this, '$data', {
            get: function() {
                return _data;
            },
            set: function(value) {
                _data = value;
                this.build(this.dom.children);
            }
        });


        this.build = function(children) {
          var tempData = this.$data;
          for(var i = 0; i < children.length; i++) {
            var el = children[i];
            if(el.type === "#text") {
              var tmpVal = el.val;
              el.val.replace(/{{(\w+)}}/gi, function(match, p1) {
                var newVal = tmpVal.replace(match, tempData[p1]);
                el.node.textContent = newVal;
                tmpVal = newVal;
              });
            } else {
                for(var prop in el.props) {
                  var tmpVal = el.props[prop];
                  el.props[prop].replace(/{{(\w+)}}/gi, function(match, p1) {
                    var dataToAdd = tempData[p1];
                    var newVal = tmpVal.replace(new RegExp(match, "gi"), dataToAdd);
                    el.node.setAttribute(prop, newVal);
                    tmpVal = newVal;
                  });
                }
                this.build(el.children);
            }
          }
        }

        this.recursiveChildren = function(children) {
          var recursiveChildrenArr = [];
          for(var i = 0; i < children.length; i++) {
            var child = children[i];
            recursiveChildrenArr.push(this.createElement(child.nodeName, this.recursiveChildren(child.childNodes), child.textContent, this.extractAttrs(child), child));
          }
          return recursiveChildrenArr;
        }

        this.createElement = function(type, children, val, props, node) {
          return {type: type, children: children, val: val, props: props, node: node};
        }

        this.createVirtualDOM = function(node) {
          var vdom = this.createElement(node.nodeName, this.recursiveChildren(node.childNodes), node.textContent, this.extractAttrs(node), node);
          this.dom = vdom;
        }

        this.seed = function() {
          this.createVirtualDOM(this.$el);
        }

        this.extractAttrs = function(node) {
          var attrs = {};
          if(!node.attributes) return attrs;
          var rawAttrs = node.attributes;
          for(var i = 0; i < rawAttrs.length; i++) {
            attrs[rawAttrs[i].name] = rawAttrs[i].value
          }

          return attrs;
        }

        this.set = function(key, val) {
          this.$data[key] = val;
          this.build(this.dom.children);
        }

        this.get = function(key) {
          return this.$data[key];
        }

        this.ajax = function(method, url, params, cb) {
          var xmlHttp = new XMLHttpRequest();
          method = method.toUpperCase();
          if(typeof params === "function") {
            cb = params;
          }
          var urlParams = "?";
          if(method === "POST") {
            http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            for(var param in params) {
              urlParams += param + "=" + params[param] + "&";
            }
          }
          xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            cb(JSON.parse(xmlHttp.responseText));
          }
          xmlHttp.open(method, url, true);
          xmlHttp.send(method === "POST" ? urlParams : null);
        }

        this.method = function(method) {
          _methods[method]();
        }

        this.seed();
        this.build(this.dom.children);
    }

    window.Moon = Moon;
    window.$ = function(el) {
      el = document.querySelectorAll(el);
      return el.length === 1 ? el[0] : el;
    }

})(window);