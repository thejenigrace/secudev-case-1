'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('PostsController', ['$scope',
	'$http', '$stateParams', '$location', '$filter', '$modal', '$log',
	'Authentication', 'Posts', 'Users', 'Post', 'AllPost',
	function ($scope, $http, $stateParams, $location, $filter, $modal, $log,
			  Authentication, Posts, Users, Post, AllPost) {

		//$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		//$scope.search = function() {
		//	//$scope.postsCount = Post.$get;
		//
		//	//console.log('Post Count: ' + $scope.postsCount);
		//
		//	var searchPost = new Post ({
		//		keyword: 'Haha'
		//	});
		//
		//	searchPost.$search(function (response) {
		//
		//	}, function (err) {
		//		console.log(err);
		//	});
		//};

		var profileUserId;
		$scope.setProfileUserId = function (userId) {
			profileUserId = userId;

			//$location.path('/user/profile/' + profileUserId);
		};

		$scope.findProfile = function () {
			console.log(profileUserId);
			$scope.profile = Users.get({
				_id: $stateParams.profileUserId
			});

			//console.log($scope.profile.firstName);
		};


		$scope.buildPager = function() {
			$scope.currentPage = 1;
			$scope.itemsPerPage = 10;
			$scope.maxSize = 5;

			$http.get('/api/posts/count').success(function (response) {
				$scope.totalItems = response.count;
				//console.log('Total Items = ' + $scope.totalItems);
			});
		};

		$scope.retrievePosts = function () {
			var allPost = new AllPost({
				currentPage: $scope.currentPage,
				keyword: 'Hahaha'
			});

			allPost.$paged(function (response) {
				$scope.pagedPosts = response.posts;
				//$scope.buildPager();
			}, function (err) {
				//console.log(err);
			});
		};

		// Initial Load of Board Posts
		$scope.buildPager();
		$scope.retrievePosts();

		$scope.pageChanged = function () {
			$log.log('Page changed to: ' + $scope.currentPage);
			$scope.retrievePosts();
		};


		//Find existing Post
		$scope.findOne = function () {
			$scope.post = Posts.get({
				postId: $stateParams.postId
			});
		};

		$scope.isAuthorize = function (postUserId) {
			//console.log($scope.user.roles.indexOf('admin'));
			//console.log("postUserId = " + postUserId);
			//console.log("user._id = " + $scope.user._id);
			if ($scope.user.roles.indexOf('admin') === 0)
				return true;
			else if (postUserId === $scope.user._id)
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
		$scope.create = function () {
			try {
				// Create new Post object
				var post = new Posts({
					message: $scope.message,
					displayName: $scope.user.displayName
				});

				// Redirect after save
				post.$save(function (response) {

					//Notify.sendMessage('New Post', {'id': response._id});

					// Reload the board posts
					$scope.retrievePosts();

					//$location.path('posts/' + response._id);
					console.log(response.clean);

					// Clear form fields
					$scope.message = '';
				}, function (errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			} catch (e) {

			}
		};

		// Remove existing Customer
		this.remove = function (post) {
			if (post) {
				post.$remove(function (response) {
					//Notify.sendMessage('Remove Post', {'id': response._id});

					// Reload the board posts
					$scope.retrievePosts();
				});

				for (var i in $scope.posts) {
					if ($scope.posts [i] === post) {
						$scope.posts.splice(i, 1);
					}
				}
			} else {
				$scope.post.$remove(function () {

				});
			}
		};
	}
]);

postsApp.controller('PostsUpdateController', ['$scope', 'Posts',
	function ($scope, Posts) {
		// Update existing Post
		this.update = function (updatedPost) {
			var post = updatedPost;

			post.$update(function () {
				//$location.path('posts/' + post._id);
			}, function (errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
	}
]);


postsApp.controller('PostsViewController', ['$scope', '$http', '$stateParams',
	'$location', '$filter', '$modal', '$log', 'Authentication', 'Posts', 'Userss',
	function ($scope, $http, $stateParams, $location, $filter, $modal, $log,
			  Authentication, Posts, Userss) {

		$scope.findProfile = function () {
			//console.log(profileUserId);
			console.log($stateParams.profileUserId);
			//$scope.user = Userss.get({
			//	userId: $stateParams.profileUserId
			//});

			//$http.get('/users/all').success(function(response){
			//	$scope.user = response;
			//});

			console.log($scope.user.firstName);
		};
	}
]);


// Angular Directive
postsApp.directive('postList', ['Posts', 'Notify',
	function (Posts, Notify) {
		return {
			restrict: 'E',
			transclude: true,
			templateUrl: 'modules/posts/views/list-posts.client.view.html'
		};
	}
]);
