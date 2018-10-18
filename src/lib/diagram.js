lib("Diagram", ["Section"], function(Section) {

    var ns = 'http://www.w3.org/2000/svg';

    function Diagram(in_data) {
        var _this = this;

        var time;

        this.id = Date.now().toString(32);

        this.sections = [];
        this.part = 0;
        this.total = 1;
        this.largestSection = 1;

        this.done = false;
        this.tick = 0;
        this.time = 0;
        this.totalTime = 0;

        this.active = null;

        this.element = document.createElementNS(ns, 'g');
        this.pathRoot = document.createElementNS(ns, 'g');
        this.element.appendChild(this.pathRoot);
        this.lineRoot = document.createElementNS(ns, 'g');
        this.element.appendChild(this.lineRoot);
        this.selectionRoot = document.createElementNS(ns, 'g');
        this.element.appendChild(this.selectionRoot);

        function init() {
            if (typeof in_data != "undefined") {
                if (typeof in_data == "number") {
                    time = in_data;
                } else {
                    _this.id = in_data.id;
                    time = in_data.time;
                    if (in_data.topics) {
                        for (var i = 0; i < in_data.topics.length; i++) {
                            var t = in_data.topics[i];
                            var abbr = _this.getUniqueAbbreviation(t.n);
                            var s = new Section(abbr, t.n, false);//.setValue(t.v);
                            _this.addSection(s);
                        }
                    }
                    if (!isNaN(in_data.active)) {
                        _this.setActive(_this.sections[in_data.active]);
                    }
                }
                _this.totalTime = time;
            }
        }

        this.addSection = function(section) {
            var offset = 0;
            for (var i = 0; i < this.sections.length - 1; i++) {
                offset += this.sections[i].getSize() * 360 / this.total;
            }

            this.sections.push(section);
            section.virtualValue = offset;
            section.setDiagram(this);
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

            this.largestSection = 0;

            var total = 0;
            this.sections.forEach(function(s) {
                var size = s.getSize();
                total += size;
                _this.largestSection = Math.max(_this.largestSection, size);
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

            if (this.$topics) {
                this.$topics.render();
            }
            if (this.$activeTopic) {
                this.$activeTopic.render();
            }
        }

        this.getTime = function() {
            return time;
        }

        this.getTimeAsTimeString = function() {
            return Diagram.getAsTimeString(this.time);
        }

        this.getUniqueAbbreviation = function(t) {
            var s = "." + this.sections.map(function(_t) {
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

        this.toDataObject = function() {
            var data = {
                id: this.id,
                time: this.totalTime,
                topics: this.sections.map(function(s) {
                    return {
                        n: s.name,
                        v: s.value,
                    };
                }),
            };
            return data;
        };

        init();
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

    return Diagram;

});