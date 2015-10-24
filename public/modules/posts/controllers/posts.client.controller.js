'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('PostsController', ['$scope', '$http', '$stateParams', '$sce',
	'$location', '$filter', '$modal', '$log', 'Authentication', 'Posts', 'Users',
	function($scope, $http, $stateParams, $sce, $location, $filter, $modal, $log,
			 Authentication, Posts, Users) {

		//$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.editorOptions = {
			language: 'ru',
			uiColor: '#000000'
		};

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

			var searchThis = {
				currentPage: $scope.currentPage,
				keyword: $scope.searchKeyword,
				type: $scope.type,
				data: $scope.data,
				concat: $scope.concat
			};

			console.log(searchThis);

			$http.post('/api/posts/search', searchThis).success(function(response) {
				$scope.pagedPosts = response;
			}, function(err){

			});

		};

		var profileUserId;
		$scope.setProfileUserId = function(userId) {
			profileUserId = userId;

			//$location.path('/user/profile/' + profileUserId);
		};

		$scope.findProfile = function() {
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
				$scope.totalItems = response;
			}, function(err) {

			});
		};

		$scope.retrievePosts = function () {
			//var allPost = new Posts({
			//	currentPage: $scope.currentPage
			//});
            //
			//allPost.$paged(function (response) {
			//	$scope.pagedPosts = response.posts;
			//}, function (err) {
			//	//console.log(err);
			//});

			$http.get('/api/posts/page/'  + $scope.currentPage).success(function(response) {
				$scope.pagedPosts = response;
			}, function(err){

			});
		};

		// Initial Load of Board Posts
		$scope.buildPager();
		$scope.retrievePosts();

		$scope.pageChanged = function () {
			$log.log('Page changed to: ' + $scope.currentPage);
			$scope.retrievePosts();
		};

		//--------------------------------------------------------------

		// Find a list of Posts
		//this.posts = Posts.query();

		// Get All Posts
		//$scope.retrievePosts = function() {
		//	Posts.query({}, function (data) {
		//		$scope.posts = data;
		//		$scope.buildPager();
		//	});
		//};
        //
		//$scope.retrievePosts();
        //
		//$scope.buildPager = function () {
		//	$scope.pagedItems = [];
		//	$scope.itemsPerPage = 10;
		//	$scope.currentPage = 1;
		//	$scope.figureOutItemsToDisplay();
		//};
        //
		//$scope.figureOutItemsToDisplay = function () {
		//	$scope.filteredItems = $filter('filter')($scope.posts, { $: $scope.search});
		//	$scope.filterLength = $scope.filteredItems.length;
		//	var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
		//	var end = begin + $scope.itemsPerPage;
		//	$scope.pagedItems = $scope.filteredItems.slice(begin, end);
		//};
        //
		//$scope.pageChanged = function() {
		//	$scope.figureOutItemsToDisplay();
		//};

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
		this.create = function() {
			try {
				// Create new Post object
				console.log($scope.message);
				var userMessage = $sce.trustAsHtml($scope.message);
				var post = new Posts ({
					message: $scope.message,
					displayName: $scope.user.displayName
				});

				// Redirect after save
				post.$save(function(response) {

					//Notify.sendMessage('New Post', {'id': response._id});
					$scope.retrievePosts();

					//$location.path('posts/' + response._id);
					console.log(response.clean);

					// Clear form fields
					$scope.message = '';
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			} catch(e) {

			}
		};

		// Remove existing Customer
		this.remove = function(post) {
			if (post) {
				//post.$remove(function(response) {
				//	//Notify.sendMessage('Remove Post', {'id': response._id});
				//	$scope.retrievePosts();
				//});

				$http.delete('/posts/' + post._id).success(function(response) {
					$scope.retrievePosts();
				});

				//for (var i in $scope.posts) {
				//	if ($scope.posts [i] === post) {
				//		$scope.posts.splice(i, 1);
				//	}
				//}
			} else {
				$scope.post.$remove(function() {

				});
			}
		};
	}
]);

postsApp.controller('PostsUpdateController', ['$scope', '$http', 'Posts',
	function($scope, $http, Posts) {
		// Update existing Post
		this.update = function(updatedPost) {
			var post = updatedPost;

			//post.$update(function() {
			//	//$location.path('posts/' + post._id);
			//}, function(errorResponse) {
			//	$scope.error = errorResponse.data.message;
			//});

			$http.put('/posts/' + post._id, post).success(function(response) {

			});
		};
	}
]);


postsApp.controller('PostsViewController', ['$scope', '$http', '$stateParams',
	'$location', '$filter', '$modal', '$log', 'Authentication', 'Posts', 'Userss',
	function($scope, $http, $stateParams, $location, $filter, $modal, $log,
			 Authentication, Posts, Userss) {

		$scope.findProfile = function() {
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
postsApp.directive('listPosts', [ 'Posts', 'Notify',
	function(Posts, Notify) {
		return {
			restrict: 'E',
			transclude: true,
			templateUrl: 'modules/posts/views/list-posts.client.view.html'
		};
	}
]);

postsApp.directive('ckEditor', [function () {
	return {
		require: '?ngModel',
		link: function ($scope, elm, attr, ngModel) {

			var ck = CKEDITOR.replace(elm[0],  {
				filebrowserBrowseUrl : '/browser/browse.php?type=Images',
				filebrowserUploadUrl : '/uploader/upload.php?type=Files'
			});

			ck.on('pasteState', function () {
				$scope.$apply(function () {
					ngModel.$setViewValue(ck.getData());
				});
			});

			ngModel.$render = function (value) {
				ck.setData(ngModel.$modelValue);
			};
		}
	};
}]);
