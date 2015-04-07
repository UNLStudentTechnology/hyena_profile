'use strict';

/**
 * @ngdoc function
 * @name hyenaProfileApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hyenaProfileApp
 */
angular.module('hyenaProfileApp')
  .controller('MainCtrl', function ($scope, $rootScope, $stateParams, FirebaseGroupService, UserService, AuthService, ReservationService, Notification) {
  	$scope.selectedTab = 0;
    //Get the selected group from the route parameters and set it in the scope
    var groupId = $stateParams.groupId;
    $scope.groupId = $rootScope.currentGroupId = groupId;

    //Check and see if the group exists in the Firebase, if not, add it.
    if(angular.isDefined(groupId) && groupId !== "")
      FirebaseGroupService.existsOrAdd(groupId);

  	//Watch for changes on the user's profile
  	$scope.$watch('currentUser', function(newValue, oldValue) {
    	if(angular.isDefined(oldValue) && newValue !== null && newValue !== oldValue && $scope.profileSettings.$valid)
    		$scope.updateUser();
    }, true);

  	/** Pushes user changes to platform */
  	$scope.updateUser = function() {
  		UserService.update($scope.currentUser.uni_auth, $scope.currentUser).then(function(response) {

  		}, function(error) {
  			Notification.show(error.message, 'error');
  		});
  	};

  	//Get User's availability
  	var availabilityUser = ReservationService.user(AuthService.userId()).$asObject();
  	availabilityUser.$bindTo($scope, 'availabilityUser');

  	availabilityUser.$loaded().then(function(response) {
  		//Get Schedule
	  	var schedule = ReservationService.schedule(AuthService.userId()).$asObject();
	  	schedule.$bindTo($scope, 'schedule');
  	});

    /**
     * Watches ng-file-upload to see if the user is attempting to upload a file.
     */
    $scope.uploadImage = function(files) {
        console.log(files[0]);
        UserService.uploadImage(AuthService.userId(), files[0]).progress(function(evt) {
          console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total) + '% file :'+ evt.config.file.name);
        }).success(function(data, status, headers, config) {
          $scope.currentUser.profile_image = data.uploaded_file;
        }).error(function(data, status, headers, config) {
          Notification.show('Sorry! There was an error uploading that image.', 'error');
          console.log('Icon upload failed:', data);
        });
    };
  });
