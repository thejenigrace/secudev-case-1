'use strict';

(function() {
	// Admins Controller Spec
	describe('Admins Controller Tests', function() {
		// Initialize global variables
		var AdminsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Admins controller.
			AdminsController = $controller('AdminsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Admin object fetched from XHR', inject(function(Admins) {
			// Create sample Admin using the Admins service
			var sampleAdmin = new Admins({
				name: 'New Admin'
			});

			// Create a sample Admins array that includes the new Admin
			var sampleAdmins = [sampleAdmin];

			// Set GET response
			$httpBackend.expectGET('admins').respond(sampleAdmins);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.admins).toEqualData(sampleAdmins);
		}));

		it('$scope.findOne() should create an array with one Admin object fetched from XHR using a adminId URL parameter', inject(function(Admins) {
			// Define a sample Admin object
			var sampleAdmin = new Admins({
				name: 'New Admin'
			});

			// Set the URL parameter
			$stateParams.adminId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/admins\/([0-9a-fA-F]{24})$/).respond(sampleAdmin);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.admin).toEqualData(sampleAdmin);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Admins) {
			// Create a sample Admin object
			var sampleAdminPostData = new Admins({
				name: 'New Admin'
			});

			// Create a sample Admin response
			var sampleAdminResponse = new Admins({
				_id: '525cf20451979dea2c000001',
				name: 'New Admin'
			});

			// Fixture mock form input values
			scope.name = 'New Admin';

			// Set POST response
			$httpBackend.expectPOST('admins', sampleAdminPostData).respond(sampleAdminResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Admin was created
			expect($location.path()).toBe('/admins/' + sampleAdminResponse._id);
		}));

		it('$scope.update() should update a valid Admin', inject(function(Admins) {
			// Define a sample Admin put data
			var sampleAdminPutData = new Admins({
				_id: '525cf20451979dea2c000001',
				name: 'New Admin'
			});

			// Mock Admin in scope
			scope.admin = sampleAdminPutData;

			// Set PUT response
			$httpBackend.expectPUT(/admins\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/admins/' + sampleAdminPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid adminId and remove the Admin from the scope', inject(function(Admins) {
			// Create new Admin object
			var sampleAdmin = new Admins({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Admins array and include the Admin
			scope.admins = [sampleAdmin];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/admins\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleAdmin);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.admins.length).toBe(0);
		}));
	});
}());