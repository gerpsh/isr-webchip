'use strict';

var webchip = angular.module('webchipApp', [
  'ngRoute',
  'webchipControllers'
]);

function isEmpty(str) {
    return (!str || 0 === str.length);
}