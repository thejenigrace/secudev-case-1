'use strict';

// Configuring the Articles module
angular.module('admin').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Admin', 'admin', 'dropdown', '/admin', null, ['admin']);
		//Menus.addSubMenuItem('topbar', 'admin', 'Users', 'admin/users/list');
		Menus.addSubMenuItem('topbar', 'admin', 'User Register', 'admin/users/create');
	}
]);
