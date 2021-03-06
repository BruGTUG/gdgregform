angular.module('gdgorgua',[])
.controller('contactForm', function($scope,$http, $window, $location,GoogleUser, GoogleEvent) {
  $scope.user = { gender:'male',t_shirt_size:'m','english_knowledge':'elementary','experience_level':'newbie' }

        if ($window.localStorage) {
            var user = $window.localStorage.getItem('user');
            if (user) {
//		  $http.get('api/participants/'+user,{params:{uid:user}}).then(function(r){ $scope.user = r.data});
                try {
                    $scope.user = JSON.parse(user);
                } catch(err) {};
            }
        }

  if (GoogleUser != null) {
      angular.extend($scope.user, {
          name: GoogleUser.given_name,
          surname: GoogleUser.family_name,
          gender: GoogleUser.gender,
          email: GoogleUser.email,
          gplus: GoogleUser.link
      });

      $scope.picture = GoogleUser.picture;
      $scope.fromGoogle = true;
  } else $scope.fromGoogle = false;

    var parts = $window.location.pathname.split('/');
    if (parts[0] == '') parts.shift();
    if (parts[0] == 'events') parts.shift();
    var event = parts[0];


  $scope.submit = function() {
    if (!$scope.contactForm.$valid) {
	console.log("form is not valid");
		return;
   }

    console.log("Saving");
    $scope.showOk = false;
    $scope.saving = true;
    $scope.showError = false;
    var savedCb = function(r) {

       $scope.saving = false;

       if ( r.status!=200 || r.data.code) {
	        $scope.showError = true;
       		console.log("error:", r);

       } else {
	        $scope.showOk = true;
	        var uid = r.data.uid;
	        if ($window.localStorage) $window.localStorage.setItem('user', JSON.stringify($scope.user));
            if (GoogleEvent && GoogleEvent.url) {
                 $window.location.href = GoogleEvent.url;
            }
       }
    } 

    $http.post('api/participants', {user: $scope.user, event: event, fields: $scope.fields}).then(savedCb, savedCb);
  }
});