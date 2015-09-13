'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('PostsController', ['$scope', '$http', '$stateParams',
	'$location', '$filter', '$modal', '$log', 'Authentication', 'Posts',
	function($scope, $http, $stateParams, $location, $filter, $modal, $log,
			 Authentication, Posts) {

		$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// Find a list of Posts
		//this.posts = Posts.query();

		// Get All Posts
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

		$scope.isAuthorize = function(postUserId) {
			//console.log($scope.user.roles.indexOf('admin'));
			//console.log("postUserId = " + postUserId);
			//console.log("user._id = " + $scope.user._id);
			if($scope.user.roles.indexOf('admin') === 0)
				return true;
			else if(postUserId === $scope.user._id)
				return true;
			else
				return false;
		};

		// Open a modal window to Update a single customer record
		this.modalUpdate = function (size, selectedPost) {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'modules/posts/views/edit-post.client.view.html',
				controller: function ($scope, $modalInstance, post) {
					// Controller for the modal instance window
					$scope.post = post;

					$scope.ok = function () {
						// if(updateCustomerForm.$valid) {
						console.log('Close Modal');

						$modalInstance.close($scope.post);
						// }
					};

					$scope.cancel = function () {
						$modalInstance.dismiss('cancel');
					};
				},
				size: size,
				resolve: {
					post: function () {
						return selectedPost;
					}
				}
			});

			modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
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

postsApp.controller('PostsUpdateController', ['$scope', 'Posts',
	function($scope, Posts) {
		// Update existing Post
		this.update = function(updatedPost) {
			var post = updatedPost;

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
