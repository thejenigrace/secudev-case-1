'use strict';

// Configuring the Articles module
angular.module('backups').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Backups', 'backups', 'dropdown', '/backups(/create)?', null, ['admin']);
		Menus.addSubMenuItem('topbar', 'backups', 'List Backups', 'backups');
		Menus.addSubMenuItem('topbar', 'backups', 'New Backup', 'backups/create');
	}
]);
