lib("DB", function() {

    var DB = {
        removeDiagram: removeDiagram,
        saveDiagram: saveDiagram,
    };

    var storage = [];
    var storageString = "indie.johnbrynte.meet";

    init();

    return DB;

    function init() {
        var _storage = localStorage.getItem(storageString);
        if (_storage) {
            try {
                storage = JSON.parse(_storage);
            } catch (e) { }
        }
    }

    function save() {
        localStorage.setItem(storageString, JSON.stringify(storage));
    }

    function removeDiagram(d) {
        if (typeof d == "object") {
            d = d.id;
        }

        var i = storage.findIndex(function(_d) {
            return _d.id === d;
        });
        if (i != -1) {
            storage.splice(i, 1);
        }

        save();
    }

    function saveDiagram(d) {
        removeDiagram(d);

        storage.push(d.toDataObject());

        save();
    }

});