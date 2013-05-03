angular.module('gdgorgua', ['ngResource','$strap'])
    .config(function($routeProvider,$httpProvider) {
        $routeProvider.
            when('/events/', {controller:'EventsListCtrl', templateUrl:'events/list.html'}).
            when('/events/new', {controller:'EventsCreateCtrl', templateUrl:'events/detail.html'}).
            when('/events/:eventId', {controller:'EventsEditCtrl', templateUrl:'events/detail.html'}).

            when('/participants/', {controller:'ParticipantsListCtrl', templateUrl:'participants/list.html'}).
            when('/participants/:participantId', {controller:'ParticipantsEditCtrl', templateUrl:'participants/detail.html'}).
            when('/participants/new', {controller:'ParticipantsCreateCtrl', templateUrl:'participants/detail.html'}).
            otherwise({redirectTo:'/events/'});

        $httpProvider.interceptors.push(function($q, $rootScope) {
            $rootScope.requests = 0;
            return {
                'request': function(config) {
                    $rootScope.requests++;
                    return config;
                },
                'response': function(response) {
                    $rootScope.requests--;
                    return response;
                },
                'responseError': function(rejection) {
                    $rootScope.error = true;
                    $rootScope.requests--;

                    return rejection;
                }
            }
         });
    })
.controller('MainCtrl', function($scope, $location) {
   $scope.$watch(function() { return $location.path()}, function(nv) {
       var parts = nv.split('/');
       $scope.current = parts[1];
   });
});