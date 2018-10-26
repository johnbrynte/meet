lib("callback", function() {

    function callback() {
        var cbs = [];

        this.on = function(c) {
            cbs.push(c);
        };

        this.off = function(c) {
            cbs.splice(cbs.indexOf(c), 1);
        };

        this.invoke = function() {
            var args = Array.prototype.slice.call(arguments);
            cbs.forEach(function(c) {
                c.apply(null, args);
            });
        };
    }

    return function factory() {
        return new callback();
    }

});