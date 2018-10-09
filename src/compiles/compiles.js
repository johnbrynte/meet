lib("compiles", ["states"], function (states) {

    states.compile({
        name: "click",
        compile: function (el, api, util) {
            el.click(function () {
                util.eval(api, el.attr("click"));
            })
        },
    });

    states.compile({
        name: "change",
        compile: function (el, api, util) {
            el.on("input", function () {
                util.eval(api, el.attr("change"), {
                    value: el.val(),
                });
            })
        },
    });

});