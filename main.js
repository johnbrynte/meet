var ns = 'http://www.w3.org/2000/svg'
var div = document.getElementById('drawing') 
var svg = document.createElementNS(ns, 'svg')
svg.setAttributeNS(null, 'width', '100%')
svg.setAttributeNS(null, 'height', '100%')
div.appendChild(svg)

var d = new Diagram(60);
d.addSection(new Section("A").setValue(5));
d.addSection(new Section("B").setValue(5));
d.addSection(new Section("C").setValue(5));

d.render();

function Section(name, target) {
    var rect = document.createElementNS(ns, 'path')
    var c = 'rgb('+[Math.round(Math.random()*255),Math.round(Math.random()*255),Math.round(Math.random()*255)].join(',')+')';
    rect.setAttributeNS(null, 'fill', c)
    svg.appendChild(rect)

    var line = document.createElementNS(ns, 'path')
    line.setAttributeNS(null, 'stroke', 'black')
    svg.appendChild(line)

    this.target = target || -1;
    this.value = 0;

    this.setValue = function(v) {
        this.value = v;
        return this;
    }

    this.render = function(offset, scale) {
        rect.setAttributeNS(null, 'd', describeArc(50, 50, 50,50,50,offset,offset + this.value*scale))
        var a = (offset-90) * Math.PI / 180;
        line.setAttributeNS(null, 'd', 'M 50 50 L '+[50+50*Math.cos(a),50+50*Math.sin(a)].join(' '))
    }
}

function Diagram(time) {
    this.sections = [];

    this.addSection = function(section) {
        this.sections.push(section);
    }

    this.render = function() {
        var part = time / this.sections.length;
        var total = 0;
        this.sections.forEach(function(s) {
            total += Math.max(part, s.value);
        });
        
        console.log(total);

        var offset = 0;
        this.sections.forEach(function(s) {
            s.render(offset, 360/total);
            offset += Math.max(part, s.value) * 360/total;
        });
    }
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(sx, sy, x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", sx,sy,
        "L", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}