lib("meet", ["states", "Diagram", "Section", "DB"], function(states, Diagram, Section, DB) {

    var ns = 'http://www.w3.org/2000/svg'

    var svg;

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

            if (params.time) {
                d = new Diagram(params.time || 60);
            }
            if (params.data) {
                d = new Diagram(params.data);
            }
            d.$topics = _api.$topics;
            d.$activeTopic = _api.$activeTopic;

            _api.setDiagram(d);
            DB.saveDiagram(d);

            svg.appendChild(d.element);

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
                setDiagram: setDiagram,
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

                var abbr = d.getUniqueAbbreviation(api.topic);
                var s = new Section(abbr, api.topic, false);
                d.addSection(s);

                //api.topics.push(s);
                api.$topics.render();
                api.$topic.set("");
            }

            function selectTopic(index) {
                d.setActive(d.sections[index]);
            }

            function setDiagram(d) {
                api.topics = d.sections;

                api.$topics.render();
                api.$topic.set("");
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

});
