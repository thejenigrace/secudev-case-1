'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('PostsController', ['$scope', '$rootScope',
	'$http', '$stateParams', '$location', '$filter', '$modal', '$log', '$q',
	'Authentication', 'Posts', 'Users', 'Post', 'AllPost', 'FindUserId',
	function ($scope, $rootScope, $http, $stateParams, $location, $filter, $modal, $log, $q,
			  Authentication, Posts, Users, Post, AllPost, FindUserId) {

		//$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.searchCriteria = [];

		$scope.addSearchCriterion = function() {
			var itemNo = $scope.searchCriteria.length;
			$scope.searchCriteria.push({'id': itemNo});
			console.log('add id:' + itemNo);
		};

		$scope.removeSearchCriterion = function(id) {
			console.log('remove id: ' + id);
			//var lastItem = $scope.searchCriteria.length - 1;
			$scope.searchCriteria.splice(id, 1);
		};

		$scope.removeAllSearchCriterion = function() {
			$scope.searchCriteria = [];
		};


		$scope.type = [];
		$scope.data = [];
		$scope.concat = [];

		$scope.searchClear = function() {
			$scope.type = [];
			$scope.data = [];
			$scope.concat = [];
		};

		$scope.search = function () {
			console.log('---SEARCH---');
			console.log('keyword: ' + $scope.searchKeyword);

			var arrAnd = [];
			var arrOr = [];

			for(var i = 0; i < $scope.searchCriteria.length; i++) {
				if($scope.concat[i] === 'and') {
					console.log('and: ' + '{' + $scope.type[i] + ': ' + $scope.data[i] + '}');
					arrAnd.push('{' + $scope.type[i] + ': ' + $scope.data[i] + '}');
				} else if($scope.concat[i] === 'or') {
					console.log('or: ' + '{' + $scope.type[i] + ': ' + $scope.data[i] + '}');
					arrOr.push('{' + $scope.type[i] + ': ' + $scope.data[i] + '}');
				}

				if($scope.type[i] === 'between') {
					console.log('start = ' + $scope.data[i].start);
					console.log('end = ' + $scope.data[i].end);
				}
			}

			var searchThis = new Post({
				currentPage: $scope.currentPage,
				keyword: $scope.searchKeyword,
				type: $scope.type,
				data: $scope.data,
				concat: $scope.concat
			});

			searchThis.$search(function(response) {
				$scope.pagedPosts = response.posts;
			}, function(err) {

			});

			$scope.searchClear();
		};

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


		$scope.buildPager = function () {
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
				keyword: $scope.searchKeyword
			});

			allPost.$paged(function (response) {
				$scope.pagedPosts = response.posts;
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
])
;

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
