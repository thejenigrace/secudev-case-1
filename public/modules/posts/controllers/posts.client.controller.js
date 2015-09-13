'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('PostsController', ['$scope',
	'$http', '$stateParams', '$location', '$filter',
	'Authentication', 'Posts', 'Notify',
	function($scope, $http, $stateParams, $location, $filter,
			 Authentication, Posts, Notify) {
		$scope.authentication = Authentication;

		//// Find a list of Posts
		//this.posts = Posts.query();

		//$scope.currentPage = 1;
		//$scope.maxSize = 5;]

		//$scope.totalItems = function() {
		//	var count;
		//	$http.get('/posts/count').success(
		//		function(response) {
		//			count = response.count;
		//		}
		//	);
		//	return count;
		//};

		//console.log('total items = ' + $scope.totalItems());

		//$scope.setPage = function(pageNo) {
		//	$scope.currentPage = pageNo;
		//};
        //
		//$scope.pageChanged = function() {
		//	$scope.loadMessages();
		//};
        //
		//$scope.loadMessages = function() {
		//	$http.get('/posts/page/' + $scope.currentPage).success(
		//		function(response) {
		//			this.posts = response;
		//		}
		//	);
		//};


		// Find existing Post
		//$scope.findOne = function() {
		//	$scope.post = Posts.get({
		//		postId: $stateParams.postId
		//	});
		//};

		// Create new Post
		$scope.create = function() {
			// Create new Post object
			var post = new Posts ({
				message: this.message
			});

			// Redirect after save
			post.$save(function(response) {

				Notify.sendMessage('New Post', {'id': response._id});

				//$location.path('posts/' + response._id);

				// Clear form fields
				$scope.message = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Customer
		this.remove = function(post) {
			if (post) {
				post.$remove(function(response) {
					Notify.sendMessage('Remove Post', {'id': response._id});
				});

				for (var i in $scope.posts) {
					if (this.posts [i] === post) {
						this.posts.splice(i, 1);
					}
				}
			} else {
				$scope.post.$remove(function() {

				});
			}
		};



		$scope.buildPager = function () {
			$scope.pagedItems = [];
			$scope.itemsPerPage = 10;
			$scope.currentPage = 1;
			$scope.figureOutItemsToDisplay();
		};

		$scope.figureOutItemsToDisplay = function () {
			$scope.filteredItems = $filter('filter')(this.posts, {$: $scope.search});
			$scope.filterLength = $scope.filteredItems.length;
			var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
			var end = begin + $scope.itemsPerPage;
			$scope.pagedItems = $scope.filteredItems.slice(begin, end);
		};

		$scope.pageChanged = function () {
			$scope.figureOutItemsToDisplay();
		};
	}
]);

postsApp.controller('PostsCreateController', ['$scope', '$stateParams', '$location',
	'Authentication', 'Posts', 'Notify',
	function($scope, $stateParams, $location, Authentication, Posts, Notify) {
		//// Create new Post
		//$scope.create = function() {
		//	// Create new Post object
		//	var post = new Posts ({
		//		message: this.message
		//	});
        //
		//	// Redirect after save
		//	post.$save(function(response) {
        //
		//		Notify.sendMessage('New Post', {'id': response._id});
        //
		//		//$location.path('posts/' + response._id);
        //
		//		// Clear form fields
		//		$scope.message = '';
		//	}, function(errorResponse) {
		//		$scope.error = errorResponse.data.message;
		//	});
		//};
	}
]);

postsApp.controller('PostsUpdateController', ['$scope', '$stateParams', '$location', 'Authentication', 'Posts',
	function($scope, $stateParams, $location, Authentication, Posts) {
		// Update existing Post
		$scope.update = function() {
			var post = $scope.post;

			post.$update(function() {
				//$location.path('posts/' + post._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);


// Angular Directive
postsApp.directive('postList', [ 'Posts', 'Notify',
	function(Posts, Notify) {
		return {
			restrict: 'E',
			transclude: true,
			templateUrl: 'modules/posts/views/list-posts.client.view.html',
			link: function (scope, element, attrs) {
				// When a new post is added, update the post list
				Notify.getMessage('New Post', function(event, data){
					scope.postsCtrl.posts = Posts.query();
				});

				// When a post is deleted, update the post list
				Notify.getMessage('Remove Post', function (event, data) {
					scope.postsCtrl.posts = Posts.query();
				});
			}
		};
	}
]);
