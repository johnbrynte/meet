lib("Section", function() {

    var ns = 'http://www.w3.org/2000/svg';

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

        var line = document.createElementNS(ns, 'path')
        line.setAttributeNS(null, 'stroke', '#ddd')

        var text = document.createElementNS(ns, 'text')
        text.setAttributeNS(null, 'text-anchor', 'middle');
        text.setAttributeNS(null, 'alignment-baseline', 'middle');
        text.innerHTML = abbr;

        var selection = document.createElementNS(ns, 'path')
        selection.setAttributeNS(null, 'class', 'selection')
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
                this.$topicBar.set(this.value / this.diagram.totalTime);
            }
        }

        this.update = function(dt, offset, scale) {
            this.virtualValue += (offset - this.virtualValue) * dt * 10;
        }

        this.getSize = function() {
            return !this.fixed ? this.total + this.value : this.value;
        }

        this.setDiagram = function(d) {
            this.diagram = d;
            d.pathRoot.appendChild(path)
            d.lineRoot.appendChild(line)
            d.lineRoot.appendChild(text)
            d.selectionRoot.appendChild(selection)
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

    return Section;

});