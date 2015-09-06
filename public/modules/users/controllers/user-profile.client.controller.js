'use strict';

angular.module('users').controller('UserProfileController', ['$scope',
    '$stateParams', '$location', 'Authentication',
    function($scope, $stateParams, $location, Authentication) {

        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');
    }
]);
