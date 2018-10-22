lib("meetMenu", ["states"], function(states) {

    states.compile({
        name: "meet-menu",
        template: "src/routes/meet/meet-menu.html",
        compile: function(el, api, util) {
            var $api = {
                open: open,
                close: close,
                toggle: toggle,
            };

            util.attach("meet-menu", el, api, $api);

            el.find(".meet-menu__backdrop").on("click", function() {
                close();
            })

            ///////

            function open() {
                el.addClass("open");

                $api.$name.update();
            }

            function close() {
                el.removeClass("open");
            }

            function toggle() {
                if (el.hasClass("open")) {
                    close();
                } else {
                    open();
                }
            }
        },
    });

});