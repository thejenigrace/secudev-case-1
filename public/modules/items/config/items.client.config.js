'use strict';

// Configuring the Articles module
angular.module('items').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Store', 'items', 'items');
		//Menus.addSubMenuItem('topbar', 'items', 'List Items', 'items');
		//Menus.addSubMenuItem('topbar', 'items', 'New Item', 'items/create');
	}
]);
