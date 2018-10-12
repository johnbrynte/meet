lib("start", ["states"], function(states) {

    states.add({
        name: "start",
        template: "src/routes/start/start.html",
        api: function() {
            var api = {
                start: start,
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

            return api;
        },
    });

});