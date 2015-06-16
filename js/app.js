'use strict';

var webchip = angular.module('phonecatApp', [
  'ngRoute',
  'webchipControllers'
]);

webchip.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/webchip', {
        templateUrl: 'partials/default.html',
        controller: 'default'
      }).
      when('/phones/:dataset', {
        templateUrl: 'partials/default.html',
        controller: 'selection'
      }).
      otherwise({
        redirectTo: '/webchip'
      });
  }]);