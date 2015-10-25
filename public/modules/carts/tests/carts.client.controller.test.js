'use strict';

(function() {
	// Carts Controller Spec
	describe('Carts Controller Tests', function() {
		// Initialize global variables
		var CartsController,
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

			// Initialize the Carts controller.
			CartsController = $controller('CartsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Cart object fetched from XHR', inject(function(Carts) {
			// Create sample Cart using the Carts service
			var sampleCart = new Carts({
				name: 'New Cart'
			});

			// Create a sample Carts array that includes the new Cart
			var sampleCarts = [sampleCart];

			// Set GET response
			$httpBackend.expectGET('carts').respond(sampleCarts);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.carts).toEqualData(sampleCarts);
		}));

		it('$scope.findOne() should create an array with one Cart object fetched from XHR using a cartId URL parameter', inject(function(Carts) {
			// Define a sample Cart object
			var sampleCart = new Carts({
				name: 'New Cart'
			});

			// Set the URL parameter
			$stateParams.cartId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/carts\/([0-9a-fA-F]{24})$/).respond(sampleCart);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.cart).toEqualData(sampleCart);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Carts) {
			// Create a sample Cart object
			var sampleCartPostData = new Carts({
				name: 'New Cart'
			});

			// Create a sample Cart response
			var sampleCartResponse = new Carts({
				_id: '525cf20451979dea2c000001',
				name: 'New Cart'
			});

			// Fixture mock form input values
			scope.name = 'New Cart';

			// Set POST response
			$httpBackend.expectPOST('carts', sampleCartPostData).respond(sampleCartResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Cart was created
			expect($location.path()).toBe('/carts/' + sampleCartResponse._id);
		}));

		it('$scope.update() should update a valid Cart', inject(function(Carts) {
			// Define a sample Cart put data
			var sampleCartPutData = new Carts({
				_id: '525cf20451979dea2c000001',
				name: 'New Cart'
			});

			// Mock Cart in scope
			scope.cart = sampleCartPutData;

			// Set PUT response
			$httpBackend.expectPUT(/carts\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/carts/' + sampleCartPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid cartId and remove the Cart from the scope', inject(function(Carts) {
			// Create new Cart object
			var sampleCart = new Carts({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Carts array and include the Cart
			scope.carts = [sampleCart];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/carts\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCart);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.carts.length).toBe(0);
		}));
	});
}());