'use strict';

//Setting up route
angular.module('posts').config(['$stateProvider',
	function($stateProvider) {
		// Posts state routing
		$stateProvider.
		//state('listPosts', {
		//	url: '/posts',
		//	templateUrl: 'modules/posts/views/list-posts.client.view.html'
		//}).
		state('createPost', {
			url: '/board/posts',
			templateUrl: 'modules/posts/views/create-post.client.view.html'
		}).
		//state('viewPost', {
		//	url: '/posts/:postId',
		//	templateUrl: 'modules/posts/views/view-post.client.view.html'
		//}).
		//state('editPost', {
		//	url: '/posts/:postId/edit',
		//	templateUrl: 'modules/posts/views/edit-post.client.view.html'
		//});
		state('viewUserProfile', {
			url: '/user/profile/:profileUserId',
			templateUrl: 'modules/posts/views/user-profile.client.view.html'
		}).
			state('completeTransaction', {
				url: '/checkout/complete/transaction',
				templateUrl: 'modules/posts/views/complete.client.view.html'
			});
	}
]);
