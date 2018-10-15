lib("start", ["states"], function(states) {

    states.add({
        name: "start",
        template: "src/routes/start/start.html",
        api: function() {
            var api = {
                start: start,
                load: load,
            };

            function start() {
                var time = timeStringToSeconds(api.time);

                if (time == 0) {
                    return;
                }

                states.set("main", {
                    time: time,
                });
            }

            function timeStringToSeconds(s) {
                if (!s) return 0;

                s = s.toLowerCase();
                var seconds = 0;
                var arr = s.split(/([0-9]+\s?(?:min|sec|hour|minutes|seconds|hours|m|s|h))/g);
                arr.forEach(function(e) {
                    m = e.match(/([0-9]+)\s?([a-z]+)/);
                    if (m) {
                        var n = parseInt(m[1]);

                        if (m[2].match(/^(s|sec|seconds)$/)) {
                        }
                        else if (m[2].match(/^(m|min|minutes)$/)) {
                            n *= 60;
                        }
                        else if (m[2].match(/^(h|hour|hours)$/)) {
                            n *= 60 * 60;
                        } else {
                            n = 0;
                        }

                        seconds += n;
                    }
                });
                return seconds;
            }

            function load() {
                var data = {
                    time: 60,
                    topics: [
                        {
                            n: "New product",
                            v: 0,
                        },
                        {
                            n: "Sales opportunity",
                            v: 0,
                        },
                        {
                            n: "Sorting",
                            v: 0,
                        },
                        {
                            n: "Sales opportunity",
                            v: 0,
                        },
                        {
                            n: "Development",
                            v: 0,
                        },
                        {
                            n: "Team building",
                            v: 0,
                        }
                    ],
                };
                states.set("main", {
                    data: data,
                });
            }

            return api;
        },
    });

});