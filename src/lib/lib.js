window.lib = (function () {

	var lib = libFactory;

	var _libs = {};

	init();

	return lib;

	////////////

	function libFactory(name, libs, constructor) {
		if (typeof _libs[name] != "undefined") {
			throw new Error("'" + name + "' is already defined");
		}

		if (typeof libs == "function") {
			constructor = libs;
			libs = [];
		}

		if (typeof libs != "undefined") {
			constructor._libs = libs;
		} else {
			constructor._libs = [];
		}

		constructor._name = name;
		constructor._ref = {};
		_libs[name] = constructor;
	}

	////////////

	function init() {
		setTimeout(initLibs);
	}

	function initLibs() {
		var roots = [],
			children = [],
			c;

		for (var name in _libs) {
			c = _libs[name];

			for (var i = 0; i < c._libs.length; i++) {
				if (children.indexOf(c._libs[i]) == -1) {
					children.push(c._libs[i]);
				}
			}
		}

		for (var name in _libs) {
			if (children.indexOf(name) == -1) {
				roots.push(name);
			}
		}

		var explored = [];

		for (var i = 0; i < roots.length; i++) {
			_explore({
				name: roots[i],
				ancestors: [],
			}, explored);
		}
	}

	function _explore(node, explored) {
		var c = _libs[node.name];

		if (node.ancestors.indexOf(node.name) != -1) {
			throw new Error("Circular dependency " + node.ancestors.map(function (name) {
				return "'" + name + "'";
			}).join(" < ") + " < '" + node.name + "'");
		}

		if (explored.indexOf(node.name) != -1) {
			return;
		}
		explored.push(node.name);

		node.ancestors.push(node.name);

		for (var i = 0; i < c._libs.length; i++) {
			_explore({
				name: c._libs[i],
				ancestors: node.ancestors.slice(),
			}, explored);
		}

		var args = [];

		for (var i = 0; i < c._libs.length; i++) {
			if (typeof _libs[c._libs[i]] == "undefined") {
				throw new Error("Unknown lib '" + c._libs[i] + "'");
			}
			args.push(_libs[c._libs[i]]._ref);
		}

		var ref = c.apply(c._ref, args);

		if (typeof (ref) != "undefined") {
			c._ref = ref;
		}
	}

})();