'use strict';

(function() {
	// Backups Controller Spec
	describe('Backups Controller Tests', function() {
		// Initialize global variables
		var BackupsController,
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

			// Initialize the Backups controller.
			BackupsController = $controller('BackupsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Backup object fetched from XHR', inject(function(Backups) {
			// Create sample Backup using the Backups service
			var sampleBackup = new Backups({
				name: 'New Backup'
			});

			// Create a sample Backups array that includes the new Backup
			var sampleBackups = [sampleBackup];

			// Set GET response
			$httpBackend.expectGET('backups').respond(sampleBackups);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.backups).toEqualData(sampleBackups);
		}));

		it('$scope.findOne() should create an array with one Backup object fetched from XHR using a backupId URL parameter', inject(function(Backups) {
			// Define a sample Backup object
			var sampleBackup = new Backups({
				name: 'New Backup'
			});

			// Set the URL parameter
			$stateParams.backupId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/backups\/([0-9a-fA-F]{24})$/).respond(sampleBackup);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.backup).toEqualData(sampleBackup);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Backups) {
			// Create a sample Backup object
			var sampleBackupPostData = new Backups({
				name: 'New Backup'
			});

			// Create a sample Backup response
			var sampleBackupResponse = new Backups({
				_id: '525cf20451979dea2c000001',
				name: 'New Backup'
			});

			// Fixture mock form input values
			scope.name = 'New Backup';

			// Set POST response
			$httpBackend.expectPOST('backups', sampleBackupPostData).respond(sampleBackupResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Backup was created
			expect($location.path()).toBe('/backups/' + sampleBackupResponse._id);
		}));

		it('$scope.update() should update a valid Backup', inject(function(Backups) {
			// Define a sample Backup put data
			var sampleBackupPutData = new Backups({
				_id: '525cf20451979dea2c000001',
				name: 'New Backup'
			});

			// Mock Backup in scope
			scope.backup = sampleBackupPutData;

			// Set PUT response
			$httpBackend.expectPUT(/backups\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/backups/' + sampleBackupPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid backupId and remove the Backup from the scope', inject(function(Backups) {
			// Create new Backup object
			var sampleBackup = new Backups({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Backups array and include the Backup
			scope.backups = [sampleBackup];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/backups\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBackup);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.backups.length).toBe(0);
		}));
	});
}());