'use strict';

// Transactions controller
angular.module('transactions').controller('TransactionsController', ['$scope', '$stateParams', '$location', '$http', '$window',
	'Authentication', 'Transactions',
	function($scope, $stateParams, $location, $http, $window, Authentication, Transactions) {
		$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.completeTransaction = function() {
			var params = $location.search();
			$http.post('/transactions/complete', params).success(function (response) {
				$location.path('/board/posts');
			});
		};

		$scope.viewTransaction = function(Id) {
			$location.path('/transactions/' + Id);
		};

		// Create new Transaction
		$scope.create = function() {
			// Create new Transaction object
			var transaction = new Transactions ({
				name: this.name
			});

			// Redirect after save
			transaction.$save(function(response) {
				$location.path('transactions/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Transaction
		$scope.remove = function(transaction) {
			if ( transaction ) {
				transaction.$remove();

				for (var i in $scope.transactions) {
					if ($scope.transactions [i] === transaction) {
						$scope.transactions.splice(i, 1);
					}
				}
			} else {
				$scope.transaction.$remove(function() {
					$location.path('transactions');
				});
			}
		};

		// Update existing Transaction
		$scope.update = function() {
			var transaction = $scope.transaction;

			transaction.$update(function() {
				$location.path('transactions/' + transaction._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Transactions
		$scope.find = function() {
			$scope.transactions = Transactions.query();
		};

		$scope.filterByDateRange = function() {
			$http.post('/transactions/filter', {startDate: $scope.startDate, endDate: $scope.endDate}).success(function(response) {
				$scope.transactions = response;
			});
		};

		// Find existing Transaction
		$scope.findOne = function() {
			$scope.transaction = Transactions.get({
				transactionId: $stateParams.transactionId
			});

			console.log($scope.transaction);
		};

		$scope.showItems = function() {
			$scope.visible = true;
		};
	}
]);
