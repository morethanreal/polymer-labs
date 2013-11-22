(function(scope) {
	var dumpBindings = function(node) {
		if (node.bindings) {
			console.log(node);
			console.log('bindings', node.bindings);
			console.log('model', node.templateInstance.model);
		}
		if (node.children) {
			Array.prototype.forEach.call(node.childNodes, function(c) {
				dumpBindings(c);
			});
		}
		if (node.shadowRoot) {
			Array.prototype.forEach.call(node.shadowRoot.childNodes, function(c) {
				dumpBindings(c);
			});
		}
	}

	window.dumpBindings = dumpBindings;

})(window);