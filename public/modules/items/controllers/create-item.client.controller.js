'use strict';

var itemsApp = angular.module('items');

itemsApp.controller('ItemsCreateController', ['$scope', '$stateParams', '$location', '$http', '$window', '$timeout',
	'Authentication', 'Items', 'FileUploader',
	function($scope, $stateParams, $location, $http, $window, $timeout,
			 Authentication, Items, FileUploader) {
		$scope.authentication = Authentication;

		$scope.user = Authentication.user;

		// If user is signed in then redirect back home
		if ($scope.user.roles.indexOf('user') === 0) $location.path('/board/posts');

		$scope.isImagePresent = false;
		$scope.isProceed = false;

		$scope.imageStatus = function() {
			$scope.isImagePresent = true;
		};

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

		// File Image Upload
		$scope.uploader = new FileUploader({
			url: '/items/upload/image',
			alis: 'newItemImage'
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
			$scope.isProceed = true;
			$scope.filename = response.filename;

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
		$scope.uploadImage = function () {
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
	}
]);
