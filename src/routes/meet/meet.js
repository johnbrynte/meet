lib("meet", ["states"], function(states) {

    var ns = 'http://www.w3.org/2000/svg'

    var svg, pathRoot, lineRoot, selectionRoot;

    var d;
    var _running = false;

    timer(update, fixedUpdate);

    var _api;

    states.compile({
        name: "topic-bar",
        compile: function(el, api, util) {
            var $api = {
                set: set,
            };

            var barEl = $("<div>").addClass("topic-bar__bar");
            el.append(barEl);

            util.attach("topic-bar", el, api, $api);

            function set(v) {
                barEl.css({
                    width: (100 * v) + "%",
                });
            }
        },
    });

    states.add({
        name: "main",
        template: "src/routes/meet/meet.html",
        load: function(params) {
            params = params || {};

            _api.topic = null;

            svg = document.createElementNS(ns, 'svg');
            // svg.setAttributeNS(null, 'width', 120)
            // svg.setAttributeNS(null, 'height', 120)
            svg.setAttributeNS(null, 'viewBox', '0 0 120 120')
            var div = document.getElementById('drawing')
            div.appendChild(svg);

            var circle = document.createElementNS(ns, 'circle')
            circle.setAttributeNS(null, 'cx', '60')
            circle.setAttributeNS(null, 'cy', '60')
            circle.setAttributeNS(null, 'r', '50')
            circle.setAttributeNS(null, 'class', 'circle-root')
            svg.appendChild(circle);

            pathRoot = document.createElementNS(ns, 'g')
            svg.appendChild(pathRoot)
            lineRoot = document.createElementNS(ns, 'g')
            svg.appendChild(lineRoot)
            selectionRoot = document.createElementNS(ns, 'g')
            svg.appendChild(selectionRoot)

            d = new Diagram(params.time || 60);
            //var topics = ["Sorting Hat", "Sorting Hat", "Sorting Hat", "Sorting Hat", "Sorting Hat"];
            var topics = ["New product", "Sales opportunity", "Sorting", "Sales opportunity", "Development", "Time building"];
            topics.forEach(t => _api.add(t));
            // d.setActive(d.sections[0]);

            $(window).on("resize", _api._diagram.resize);

            _running = true;
        },
        unload: function() {
            _running = false;

            $(window).off("resize", _api._diagram.resize);
        },
        api: function() {
            var api = {
                back: back,
                topics: [],
                activeTopic: activeTopic,
                activeIndex: activeIndex,
                add: add,
                selectTopic: selectTopic,
                _diagram: {
                    resize: diagramResize,
                },
            };

            _api = api;

            function back() {
                states.set("start");
            }

            function add(topic) {
                if (!api.topic) {
                    if (!topic) {
                        return;
                    }
                    api.topic = topic;
                }

                var abbr = getUniqueAbbreviation(api.topic);
                var s = new Section(abbr, api.topic, false);
                d.addSection(s);

                api.topics.push({
                    abbr: abbr,
                    text: api.topic,
                    color: s.color,
                    antiColor: s.antiColor,
                });
                api.$topics.render();
                api.$topic.set("");

                s.$topicBar = api.topics[api.topics.length - 1];
            }

            function selectTopic(index) {
                d.setActive(d.sections[index]);
            }

            function activeTopic() {
                return d && d.active ? d.active.name : null;
            }

            function activeIndex() {
                return d.sections.indexOf(d.active);
            }

            function diagramResize() {
                var windowHeight = $(window).height();

                if (windowHeight < _api._diagram.windowHeight) {
                    _api._diagram.windowHeight = windowHeight;

                    var e = $("#drawing svg")[0];
                    var r = $("#drawing").height() / _api._diagram.svgWidth;

                    if (r < 1) {
                        e.setAttributeNS(null, "viewBox", "0 0 120 " + (120 * r));
                    }
                } else {
                    _api._diagram.windowHeight = windowHeight;
                    _api._diagram.svgWidth = $("#drawing svg").width();
                    _api._diagram.svgHeight = $("#drawing").height();

                    var e = $("#drawing svg")[0];

                    e.setAttributeNS(null, "viewBox", "0 0 120 120");
                }
            }

            function getUniqueAbbreviation(t) {
                var s = "." + api.topics.map(function(_t) {
                    return _t.abbr;
                }).join(".") + ".";

                t = t.trim().toLowerCase();

                var p = t.split(/\s+/g);
                var size = 0;
                var index = p.map(function(_p) {
                    size += _p.length;
                    return 0;
                });
                var parts = p.map(function() {
                    return "";
                });

                var i = 0;
                var j = 0;
                while (i < size) {
                    parts[j] += parts[j].length == 0 ? p[j][index[j]].toUpperCase() : p[j][index[j]];
                    var abbr = parts.join("");

                    if (checkAvailability(abbr)) {
                        return abbr;
                    }

                    i++;
                    index[j]++;
                    j = (j + 1) % parts.length;
                }

                return t;

                function checkAvailability(a) {
                    return !s.match(new RegExp("\\." + a + "\\.", "g"));
                }
            }

            return api;
        },
    });

    function update(dt) {
        if (_running) {
            d.render();

            document.getElementById("mainTime").innerHTML = d.getTimeAsTimeString();
            document.getElementById("mainOfTime").innerHTML = Diagram.getAsTimeString(d.getTime());
        }
    }

    function fixedUpdate(dt) {
        if (_running) {
            d.update(dt);
        }
    }

    function Section(abbr, name, fixed) {
        var _this = this;

        var c = [Math.round(255 - Math.random() * 128), Math.round(255 - Math.random() * 128), Math.round(255 - Math.random() * 128)];

        this.abbr = abbr;
        this.name = name;
        this.active = false;
        this.color = 'rgb(' + c.join(',') + ')';
        this.antiColor = getContrast(c);

        // http://24ways.org/2010/calculating-color-contrast/
        function getContrast(c) {
            var r = c[0],
                g = c[1],
                b = c[2],
                yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return (yiq >= 128) ? 'black' : 'white';
        }

        var path = document.createElementNS(ns, 'path')
        path.setAttributeNS(null, 'fill', this.color)
        pathRoot.appendChild(path)

        var line = document.createElementNS(ns, 'path')
        line.setAttributeNS(null, 'stroke', '#ddd')
        lineRoot.appendChild(line)

        var text = document.createElementNS(ns, 'text')
        text.setAttributeNS(null, 'text-anchor', 'middle');
        text.setAttributeNS(null, 'alignment-baseline', 'middle');
        text.innerHTML = abbr;
        lineRoot.appendChild(text)

        var selection = document.createElementNS(ns, 'path')
        selection.setAttributeNS(null, 'class', 'selection')
        selectionRoot.appendChild(selection)
        selection.addEventListener("click", function() {
            _this.diagram.setActive(_this);
        })
        this.selectionEl = selection;

        this.total = 0;
        this.value = 0;
        this.virtualValue = 0;
        this.diagram = null;

        this.setValue = function(v) {
            this.value = v;
            return this;
        }

        this.render = function(scale) {
            var offset = this.virtualValue;
            path.setAttributeNS(null, 'd', describeArc(60, 60, 60, 60, 50, offset, Math.min(359.999, offset + this.value * scale)))
            selection.setAttributeNS(null, 'd', describeArc(60, 60, 60, 60, 50, offset, Math.min(359.999, offset + this.getSize() * scale)))
            var a = (offset - 90) * Math.PI / 180;
            line.setAttributeNS(null, 'd', 'M 60 60 L ' + [60 + 50 * Math.cos(a), 60 + 50 * Math.sin(a)].join(' '))

            text.setAttributeNS(null, 'x', 60 + 55 * Math.cos(Math.PI * (offset + this.getSize() * scale / 2 - 90) / 180));
            text.setAttributeNS(null, 'y', 60 + 55 * Math.sin(Math.PI * (offset + this.getSize() * scale / 2 - 90) / 180));

            if (this.$topicBar) {
                this.$topicBar.$topicBar.set(this.value / this.diagram.totalTime);
            }
        }

        this.update = function(dt, offset, scale) {
            this.virtualValue += (offset - this.virtualValue) * dt * 10;
        }

        this.getSize = function() {
            return !this.fixed ? this.total + this.value : this.value;
        }
    }

    function Diagram(time) {
        this.sections = [];
        this.part = 0;
        this.total = 1;

        this.done = false;
        this.tick = 0;
        this.time = 0;
        this.totalTime = time;

        this.active = null;

        this.addSection = function(section) {
            var offset = 0;
            for (var i = 0; i < this.sections.length - 1; i++) {
                offset += this.sections[i].getSize() * 360 / this.total;
            }

            this.sections.push(section);
            section.diagram = this;
            section.virtualValue = offset;
        }

        this.render = function() {
            var _this = this;
            var offset = 0;
            this.sections.forEach(function(s) {
                s.render(360 / _this.total);
                //offset += Math.max(_this.part, s.virtualValue) * 360 / _this.total;
            });
        }

        this.update = function(dt) {
            var _this = this;

            this.tick += dt * 1;

            var _total = 0;
            this.sections.forEach(function(s) {
                _total += s.value;
            });
            var _timeLeft = Math.max(0, time - _total);
            var _part = time / (this.sections.length || 1);

            var _partTotal = 0;
            this.sections.forEach(function(s) {
                if (s.value >= _part) {
                    s._part = 0;
                } else {
                    s._part = s.value == 0 ? 1 : (_part - s.value) / _part;
                }
                _partTotal += s._part;
            });
            this.sections.forEach(function(s) {
                s.total = _timeLeft * s._part / _partTotal;
            });

            var total = 0;
            this.sections.forEach(function(s) {
                total += s.getSize();
            });
            this.part = _part;
            this.total = total;

            if (this.active) {

                if (!this.done) {
                    this.active.value += dt * 1;
                    this.time += dt * 1;

                    if (this.time >= time) {
                        this.done = true;
                        document.getElementById("mainTime").className += "overtime";
                    }
                }
            }

            var offset = 0;
            this.sections.forEach(function(s) {
                s.update(dt, offset, 360 / _this.total);
                offset += s.getSize() * 360 / _this.total;
            });
        }

        this.setActive = function(s) {
            if (this.active) {
                this.active.selectionEl.setAttributeNS(null, 'class', 'selection')
                this.active.active = false;
            }
            this.active = s;
            this.active.selectionEl.setAttributeNS(null, 'class', 'selection active')
            this.active.active = true;

            _api.$topics.render();
            _api.$activeTopic.render();
        }

        this.getTime = function() {
            return time;
        }

        this.getTimeAsTimeString = function() {
            return Diagram.getAsTimeString(this.time);
        }
    }

    Diagram.getAsTimeString = function(time) {
        var sec = Math.floor(time);
        var hour = Math.floor(sec / (60 * 60));
        sec = sec - hour * 60 * 60;
        var min = Math.floor(sec / 60);
        sec = sec - min * 60;
        return [hour, numberToTwoDigit(min), numberToTwoDigit(sec)].join(":");

        function numberToTwoDigit(n) {
            return n < 10 ? "0" + n : "" + n;
        }
    }

    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    function describeArc(sx, sy, x, y, radius, startAngle, endAngle) {

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", sx, sy,
            "L", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");

        return d;
    }
});
