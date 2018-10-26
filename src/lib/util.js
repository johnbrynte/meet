lib("util", ["callback"], function(callback) {

    var self = {
        onWindowBlur: callback(),
        onWindowFocus: callback(),
    };

    init();

    return self;

    ////////////

    function init() {
        window.addEventListener("blur", self.onWindowBlur.invoke);
        window.addEventListener("focus", self.onWindowFocus.invoke);
    }

});