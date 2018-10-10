lib("compiles", ["states"], function (states) {

    states.compile({
        name: "for",
        compile: function (el, api, util) {
            var $api = {
                render: render,
            };

            util.attach("for", el, api, $api);

            var listVariable = el.attr("for");

            var nodeEl = document.createComment("for");
            $(nodeEl).insertBefore(el);
            var nodeEndEl = document.createComment("for end");
            $(nodeEndEl).insertAfter(el);
            el.remove();

            $api.render();

            function render() {
                var list = util.eval(api, listVariable);

                while (nodeEl.nextSibling != nodeEndEl) {
                    nodeEl.nextSibling.remove();
                }

                if (list) {
                    for (var i in list) {
                        var iEl = el.clone();
                        iEl.insertBefore(nodeEndEl);

                        util.compileElement(iEl, {
                            parent: api,
                            index: i,
                            item: list[i],
                        }, true);
                    }
                }
            }
        },
    })

    states.compile({
        name: "click",
        compile: function (el, api, util) {
            el.click(function () {
                util.eval(api, el.attr("click"));
            })
        },
    });

    states.compile({
        name: "enter",
        compile: function (el, api, util) {
            el.on("keydown", function (evt) {
                if (evt.which == 13) {
                    util.eval(api, el.attr("enter"));
                }
            })
        },
    });

    states.compile({
        name: "change",
        compile: function (el, api, util) {
            var $api = {
                set: set,
            };

            util.attach("change", el, api, $api);

            el.on("input", function () {
                change();
            })

            function set(val) {
                el.val(val);
                change();
            }

            function change() {
                util.eval(api, el.attr("change"), {
                    value: el.val(),
                });
            }
        },
    });

    states.compile({
        name: "bind",
        compile: function (el, api, util) {
            var $api = {
                render: render,
            };

            util.attach("bind", el, api, $api);

            $api.render();

            function render() {
                el.html(util.eval(api, el.attr("bind")));
            }
        },
    });

    states.compile({
        name: "class-obj",
        compile: function (el, api, util) {
            var $api = {
                render: render,
            };

            util.attach("class-obj", el, api, $api);

            $api.render();

            function render() {
                var objString = util.eval(api, "JSON.stringify(" + el.attr("class-obj") + ")");
                var obj = JSON.parse(objString);
                for (var c in obj) {
                    if (obj[c]) {
                        el.addClass(c);
                    } else {
                        el.removeClass(c);
                    }
                }
            }
        },
    });

    states.compile({
        name: "style-obj",
        compile: function (el, api, util) {
            var $api = {
                render: render,
            };

            util.attach("style-obj", el, api, $api);

            $api.render();

            function render() {
                var objString = util.eval(api, "JSON.stringify(" + el.attr("style-obj") + ")");
                var obj = JSON.parse(objString);
                console.log(objString);
                el.css(obj);
            }
        },
    });

});