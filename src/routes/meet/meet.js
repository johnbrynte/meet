lib("meet", ["states"], function (states) {

    var ns = 'http://www.w3.org/2000/svg'

    var svg;

    var d;
    var _running = false;

    timer(update, fixedUpdate);

    var _api;

    states.add({
        name: "main",
        template: "src/routes/meet/meet.html",
        load: function (params) {
            svg = document.createElementNS(ns, 'svg');
            // svg.setAttributeNS(null, 'width', 120)
            // svg.setAttributeNS(null, 'height', 120)
            svg.setAttributeNS(null, 'viewBox', '0 0 120 120')
            var div = document.getElementById('drawing')
            div.appendChild(svg);

            d = new Diagram(params.time || 60);
            // for (var i = 0; i < 5; i++) {
            //     d.addSection(new Section("A", false).setValue(0));
            // }

            window.addEventListener("keydown", onkeydown);

            _running = true;
        },
        unload: function () {
            window.removeEventListener("keydown", onkeydown);

            _running = false;
        },
        api: function () {
            var api = {
                back: back,
                topics: [],
                activeTopic: activeTopic,
                activeIndex: activeIndex,
                add: add,
                selectTopic: selectTopic,
            };

            _api = api;

            function back() {
                states.set("start");
            }

            function add() {
                if (!api.topic) {
                    return;
                }

                var s = new Section(api.topic, false);
                d.addSection(s);

                api.topics.push({
                    text: api.topic,
                    color: s.color,
                });
                api.$topics.render();
                api.$topic.set("");
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

            return api;
        },
    });

    function onkeydown(evt) {
        switch (evt.keyCode) {
            case 32:
                d.addSection(new Section("A", false).setValue(0));
                break;
        }
    }

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

    function Section(name, fixed) {
        var _this = this;

        this.name = name;
        this.active = false;
        this.color = 'rgb(' + [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)].join(',') + ')';

        var path = document.createElementNS(ns, 'path')
        path.setAttributeNS(null, 'fill', this.color)
        svg.appendChild(path)

        var line = document.createElementNS(ns, 'path')
        line.setAttributeNS(null, 'stroke', 'black')
        svg.appendChild(line)

        var selection = document.createElementNS(ns, 'path')
        selection.setAttributeNS(null, 'class', 'selection')
        svg.appendChild(selection)
        selection.addEventListener("click", function () {
            _this.diagram.setActive(_this);
        })
        this.selectionEl = selection;

        this.value = 0;
        this.virtualValue = 0;
        this.diagram = null;

        this.setValue = function (v) {
            this.value = v;
            return this;
        }

        this.render = function (scale) {
            var offset = this.virtualValue;
            path.setAttributeNS(null, 'd', describeArc(60, 60, 60, 60, 50, offset, offset + this.value * scale))
            selection.setAttributeNS(null, 'd', describeArc(60, 60, 60, 60, 50, offset, offset + this.getSize() * scale))
            var a = (offset - 90) * Math.PI / 180;
            line.setAttributeNS(null, 'd', 'M 60 60 L ' + [60 + 50 * Math.cos(a), 60 + 50 * Math.sin(a)].join(' '))
        }

        this.update = function (dt, offset, scale) {
            this.virtualValue += (offset - this.virtualValue) * dt * 10;
        }

        this.getSize = function () {
            return Math.max(this.value, !this.fixed ? this.diagram.part : this.value);
        }
    }

    function Diagram(time) {
        this.sections = [];
        this.part = 0;
        this.total = 1;

        this.done = false;
        this.tick = 0;
        this.time = 0;

        this.active = null;

        this.addSection = function (section) {
            var offset = 0;
            for (var i = 0; i < this.sections.length - 1; i++) {
                offset += this.sections[i].getSize() * 360 / this.total;
            }

            this.sections.push(section);
            section.diagram = this;
            section.virtualValue = offset;
        }

        this.render = function () {
            var _this = this;
            var offset = 0;
            this.sections.forEach(function (s) {
                s.render(360 / _this.total);
                //offset += Math.max(_this.part, s.virtualValue) * 360 / _this.total;
            });
        }

        this.update = function (dt) {
            this.tick += dt * 1;

            var _this = this;
            var part = time / (this.sections.length || 1);
            var total = 0;
            this.sections.forEach(function (s) {
                total += Math.max(part, s.value);
            });
            this.part = part;
            this.total = total;

            if (this.active) {
                this.active.value += dt * 1;
                this.time += dt * 1;

                if (!this.done) {
                    if (this.time >= time) {
                        this.done = true;
                        document.getElementById("mainTime").className += "overtime";
                    }
                }
            }

            var offset = 0;
            this.sections.forEach(function (s) {
                s.update(dt, offset, 360 / _this.total);
                offset += s.getSize() * 360 / _this.total;
            });
        }

        this.setActive = function (s) {
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

        this.getTime = function () {
            return time;
        }

        this.getTimeAsTimeString = function () {
            return Diagram.getAsTimeString(this.time);
        }
    }

    Diagram.getAsTimeString = function (time) {
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
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }
});