'use strict';

// Items controller
angular.module('items').controller('ItemsController', ['$scope', '$stateParams', '$location', '$http', '$window',
	'$timeout', 'Authentication', 'Items', 'FileUploader',
	function($scope, $stateParams, $location, $http, $window, $timeout, Authentication, Items, FileUploader) {
		$scope.authentication = Authentication;

		$scope.user = Authentication.user;

		$scope.isReady = true;
		// Create new Item
		$scope.create = function() {
			// Create new Item object
			var item = new Items ({
				name: this.name,
				description: this.description,
				price: this.price,
				image: $scope.filename
			});

			// Redirect after save
			item.$save(function(response) {
				$location.path('items/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.description = '';
				$scope.image = '';
				$scope.price = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

		};

		// Remove existing Item
		$scope.remove = function(item) {
			if ( item ) {
				item.$remove();

				for (var i in $scope.items) {
					if ($scope.items [i] === item) {
						$scope.items.splice(i, 1);
					}
				}
			} else {
				$scope.item.$remove(function() {
					$location.path('items');
				});
			}
		};

		// Update existing Item
		$scope.update = function() {
			var item = $scope.item;

			item.$update(function() {
				$location.path('items/' + item._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Items
		$scope.find = function() {
			$scope.items = Items.query();
		};

		// Find existing Item
		$scope.findOne = function() {
			$scope.item = Items.get({
				itemId: $stateParams.itemId
			});
		};

		$scope.isAdmin = function() {
			if($scope.user.roles.indexOf('admin') === 0)
				return true;
			else
				return false;
		};

		$scope.isUser = function() {
			if($scope.user.roles.indexOf('user') === 0)
				return true;
			else
				return false;
		};

		// File Image Upload
		$scope.uploader = new FileUploader({
			url: '/items/upload/image'
		});

		$scope.uploader.filters.push({
			name: 'imageFilter',
			fn: function(item, options) {
				var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
				return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
			}
		});

		// Called after the user selected a new picture file
		$scope.uploader.onAfterAddingFile = function (fileItem) {
			if ($window.FileReader) {
				var fileReader = new FileReader();
				fileReader.readAsDataURL(fileItem._file);

				fileReader.onload = function (fileReaderEvent) {
					$timeout(function () {
						$scope.imageURL = fileReaderEvent.target.result;
					}, 0);
				};
			}
		};

		// Called after the user has successfully uploaded a new picture
		$scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
			// Show success message
			$scope.success = true;

			// Populate user object
			//$scope.user = Authentication.user = response;
			$scope.filename = response.filename;
			$scope.isReady = false;

			// Clear upload buttons
			$scope.cancelUpload();
		};

		// Called after the user has failed to uploaded a new picture
		$scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
			// Clear upload buttons
			$scope.cancelUpload();

			// Show error message
			$scope.error = response.message;
		};

		// Change user profile picture
		$scope.uploadPicture = function () {
			// Clear messages
			$scope.success = $scope.error = null;

			// Start upload
			$scope.uploader.uploadAll();
		};

		// Cancel the upload process
		$scope.cancelUpload = function () {
			$scope.uploader.clearQueue();
			//$scope.imageURL = $scope.user.profileImageURL;
		};

		// ENd of File Upload
		//this.remove = function(item) {
		//	if (item) {
		//		//post.$remove(function(response) {
		//		//	//Notify.sendMessage('Remove Post', {'id': response._id});
		//		//	$scope.retrievePosts();
		//		//});
        //
		//		$http.delete('/posts/' + post._id).success(function(response) {
		//			$scope.retrievePosts();
		//		});
        //
		//		//for (var i in $scope.posts) {
		//		//	if ($scope.posts [i] === post) {
		//		//		$scope.posts.splice(i, 1);
		//		//	}
		//		//}
		//	} else {
		//		$scope.post.$remove(function() {
        //
		//		});
		//	}
		//};
	}
]);
