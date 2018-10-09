lib("start", ["states"], function (states) {

    states.add({
        name: "start",
        template: "src/routes/start/start.html",
        api: function () {
            var api = {
                test: test,
            };

            function test() {
                var time = parseInt(api.time);
                if (isNaN(time)) {
                    time = null;
                }

                states.set("main", {
                    time: time,
                });
            }

            return api;
        },
    });

});