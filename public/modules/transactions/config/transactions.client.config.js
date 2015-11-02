'use strict';

// Configuring the Articles module
angular.module('transactions').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		//Menus.addMenuItem('topbar', 'Transactions', 'transactions', 'transactions');
		//Menus.addSubMenuItem('topbar', 'transactions', 'List Transactions', 'transactions');
		//Menus.addSubMenuItem('topbar', 'transactions', 'New Transaction', 'transactions/create');
	}
]);
