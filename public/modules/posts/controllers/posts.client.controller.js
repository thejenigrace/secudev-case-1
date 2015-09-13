'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('PostsController', ['$scope',
	'$http', '$stateParams', '$location', '$filter',
	'Authentication', 'Posts',
	function($scope, $http, $stateParams, $location, $filter,
			 Authentication, Posts) {

		$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// Find a list of Posts
		//this.posts = Posts.query();

		// Get Posts
		$scope.retrievePosts = function() {
			Posts.query({}, function (data) {
				$scope.posts = data;
				$scope.buildPager();
			});
		};

		$scope.retrievePosts();

		$scope.buildPager = function () {
			$scope.pagedItems = [];
			$scope.itemsPerPage = 10;
			$scope.currentPage = 1;
			$scope.figureOutItemsToDisplay();
		};

		$scope.figureOutItemsToDisplay = function () {
			$scope.filteredItems = $filter('filter')($scope.posts, { $: $scope.search});
			$scope.filterLength = $scope.filteredItems.length;
			var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
			var end = begin + $scope.itemsPerPage;
			$scope.pagedItems = $scope.filteredItems.slice(begin, end);
		};

		$scope.pageChanged = function() {
			$scope.figureOutItemsToDisplay();
		};

		//Find existing Post
		$scope.findOne = function() {
			$scope.post = Posts.get({
				postId: $stateParams.postId
			});
		};

		// Create new Post
		$scope.create = function() {
			// Create new Post object
			var post = new Posts ({
				message: this.message
			});

			// Redirect after save
			post.$save(function(response) {

				//Notify.sendMessage('New Post', {'id': response._id});
				$scope.retrievePosts();

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
					//Notify.sendMessage('Remove Post', {'id': response._id});
					$scope.retrievePosts();
				});

				for (var i in $scope.posts) {
					if ($scope.posts [i] === post) {
						$scope.posts.splice(i, 1);
					}
				}
			} else {
				$scope.post.$remove(function() {

				});
			}
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
			templateUrl: 'modules/posts/views/list-posts.client.view.html'
			//link: function (scope, element, attrs) {
			//	// When a new post is added, update the post list
			//	Notify.getMessage('New Post', function(event, data){
			//		//scope.setPosts(Posts.query());
			//		scope.posts = Posts.query();
			//	});
            //
			//	// When a post is deleted, update the post list
			//	Notify.getMessage('Remove Post', function (event, data) {
			//		//scope.PostCtrl.posts = Posts.query();
			//	});
			//}
		};
	}
]);
