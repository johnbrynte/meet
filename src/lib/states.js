lib("states", function() {

    var self = {
        add: add,
        set: set,
        compile: compile,
        current: current,
    };

    var _compileAPI = {
        eval: compileEval,
        compileElement: compileElement,
        attach: compileAttach,
    }

    var _current = null;
    var _currentAPI = null;
    var _states = {};
    var _compiles = {};
    var _rootElem = null;
    var _templateCache = {};

    return self;

    function add(opts) {
        _states[opts.name] = opts;
    }

    function set(name, params) {
        if (!_states[name]) {
            throw new Error("No such state");
        }
        var opts = _states[name];

        var state = current();
        if (state && state.unload) {
            state.unload();
        }

        _current = opts;
        _currentAPI = null;

        var el = _getRootElem();
        el.html("");

        new Promise(function(resolve, reject) {
            if (opts.template) {
                _loadTemplate(opts.template).then(function() {
                    _compileTemplate(opts.template);
                    resolve();
                });
            } else {
                resolve();
            }
        }).then(function() {
            if (opts.load) {
                opts.load(params);
            }
        })
    }

    function compile(opts) {
        _compiles[opts.name] = opts;
    }

    function current() {
        return _current;
    }

    function compileEval(api, str, params) {
        return (function() {
            try {
                return eval(str);
            } catch (e) { }
        }).call(this);
    }

    function compileElement(el, api, skipRootEl) {
        _compileElement($(el), api, skipRootEl);
    }

    function compileAttach(_name, el, api, _api) {
        if (typeof el.attr(_name + "-api") != "undefined") {
            return (function() {
                try {
                    return eval(el.attr(_name + "-api") + " = _api");
                } catch (e) { }
            }).call(this);
        }
    }

    function _getRootElem() {
        if (!_rootElem) {
            _rootElem = $("[state-view]");
        }
        return _rootElem;
    }

    function _loadTemplate(template) {
        return new Promise(function(resolve, reject) {
            if (_templateCache[template]) {
                resolve(_templateCache[template]);
                return;
            }

            var r = new XMLHttpRequest();
            r.open("GET", template);
            r.onload = function() {
                _templateCache[template] = r.responseText;
                resolve(_templateCache[template]);
            };
            r.send();
        });
    }

    function _compileTemplate(template) {
        var el = _getRootElem();
        el.html(_templateCache[template]);

        if (_current.api) {
            _currentAPI = _current.api.apply(null);
        }

        _compileElement(el, _currentAPI, true);
    }

    function _compileElement(el, api, skipRootEl) {
        var elems = {};
        for (var name in _compiles) {
            elems[name] = el.find("[" + name + "]");
        }
        for (var name in _compiles) {
            var c = _compiles[name];

            if (!skipRootEl && typeof el.attr(name) != "undefined") {
                _compileCompile(c, el, api);
            }

            elems[name].each(function(i, e) {
                _compileCompile(c, $(e), api);
            });
        }
    }

    function _compileCompile(c, el, api) {
        if (c.template) {
            _loadTemplate(c.template).then(function(template) {
                el.html(template);
                _comp();
                // recursive
                //setTimeout(function() {
                _compileElement(el, api, true);
                //});
            });
        } else {
            _comp();
        }

        function _comp() {
            c.compile.apply(null, [$(el), api, _compileAPI]);
        }
    }

});