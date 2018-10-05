var ns = 'http://www.w3.org/2000/svg'
var div = document.getElementById('drawing')
var svg = document.createElementNS(ns, 'svg')
// svg.setAttributeNS(null, 'width', 120)
// svg.setAttributeNS(null, 'height', 120)
svg.setAttributeNS(null, 'viewBox', '0 0 120 120')
div.appendChild(svg)

var d = new Diagram(60);

timer(update, fixedUpdate);

window.addEventListener("keydown", function (evt) {
    switch (evt.keyCode) {
        case 32:
            d.addSection(new Section("A", false).setValue(0));
            break;
    }
})

for (var i = 0; i < 5; i++) {
    d.addSection(new Section("A", false).setValue(0));
}

function update(dt) {
    d.render();
}

function fixedUpdate(dt) {
    d.update(dt);
}

function Section(name, fixed) {
    var _this = this;

    this.active = false;

    var path = document.createElementNS(ns, 'path')
    var c = 'rgb(' + [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)].join(',') + ')';
    path.setAttributeNS(null, 'fill', c)
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
        if (!this.done) {
            this.tick += dt * 1;
            if (this.tick >= time) {
                this.done = true;
            }
        }

        var _this = this;
        var part = time / this.sections.length;
        var total = 0;
        this.sections.forEach(function (s) {
            total += Math.max(part, s.value);
        });
        this.part = part;
        this.total = total;

        if (this.active) {
            this.active.value += dt * 1;
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