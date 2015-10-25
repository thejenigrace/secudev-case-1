'use strict';

(function() {
	// Transactions Controller Spec
	describe('Transactions Controller Tests', function() {
		// Initialize global variables
		var TransactionsController,
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

			// Initialize the Transactions controller.
			TransactionsController = $controller('TransactionsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Transaction object fetched from XHR', inject(function(Transactions) {
			// Create sample Transaction using the Transactions service
			var sampleTransaction = new Transactions({
				name: 'New Transaction'
			});

			// Create a sample Transactions array that includes the new Transaction
			var sampleTransactions = [sampleTransaction];

			// Set GET response
			$httpBackend.expectGET('transactions').respond(sampleTransactions);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.transactions).toEqualData(sampleTransactions);
		}));

		it('$scope.findOne() should create an array with one Transaction object fetched from XHR using a transactionId URL parameter', inject(function(Transactions) {
			// Define a sample Transaction object
			var sampleTransaction = new Transactions({
				name: 'New Transaction'
			});

			// Set the URL parameter
			$stateParams.transactionId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/transactions\/([0-9a-fA-F]{24})$/).respond(sampleTransaction);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.transaction).toEqualData(sampleTransaction);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Transactions) {
			// Create a sample Transaction object
			var sampleTransactionPostData = new Transactions({
				name: 'New Transaction'
			});

			// Create a sample Transaction response
			var sampleTransactionResponse = new Transactions({
				_id: '525cf20451979dea2c000001',
				name: 'New Transaction'
			});

			// Fixture mock form input values
			scope.name = 'New Transaction';

			// Set POST response
			$httpBackend.expectPOST('transactions', sampleTransactionPostData).respond(sampleTransactionResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Transaction was created
			expect($location.path()).toBe('/transactions/' + sampleTransactionResponse._id);
		}));

		it('$scope.update() should update a valid Transaction', inject(function(Transactions) {
			// Define a sample Transaction put data
			var sampleTransactionPutData = new Transactions({
				_id: '525cf20451979dea2c000001',
				name: 'New Transaction'
			});

			// Mock Transaction in scope
			scope.transaction = sampleTransactionPutData;

			// Set PUT response
			$httpBackend.expectPUT(/transactions\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/transactions/' + sampleTransactionPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid transactionId and remove the Transaction from the scope', inject(function(Transactions) {
			// Create new Transaction object
			var sampleTransaction = new Transactions({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Transactions array and include the Transaction
			scope.transactions = [sampleTransaction];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/transactions\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTransaction);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.transactions.length).toBe(0);
		}));
	});
}());