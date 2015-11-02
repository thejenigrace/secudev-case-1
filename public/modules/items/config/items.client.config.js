'use strict';

// Configuring the Articles module
angular.module('items').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'The Store', 'store');
		//Menus.addSubMenuItem('topbar', 'items', 'List Items', 'items');
		//Menus.addSubMenuItem('topbar', 'items', 'New Item', 'items/create');
	}
]);
