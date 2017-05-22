/**
 * Copyright reelyActive 2017
 * We believe in an open Internet of Things
 */

angular.module('orientation', [ 'ui.bootstrap', 'reelyactive.beaver' ])

  /**
   * OrientationCtrl Controller
   * Handles the manipulation of all variables accessed by the HTML view.
   */
  .controller('OrientationCtrl', function($scope, beaver) {

    $scope.url = 'https://pareto.reelyactive.com';
    $scope.connectionMessage = 'First connect to a websocket data stream';
    $scope.displayConnection = true;
    $scope.connected = false;
    $scope.sensor = null;
    $scope.orientation = ['', '', '', '', '', '', '', ''];
    $scope.deviceId = 'No accelerometer beacon detected';

    var socket;

    beaver.on('appearance', function(event) {
      handleEvent(event);
    });
    beaver.on('keep-alive', function(event) {
      handleEvent(event);
    });
    beaver.on('displacement', function(event) {
      handleEvent(event);
    });
    beaver.on('disappearance', function(event) {
      handleEvent(event);
    });

    function handleEvent(event) {
      if(event.tiraid.identifier.hasOwnProperty('advData') &&
         event.tiraid.identifier.advData.hasOwnProperty('serviceData') &&
         event.tiraid.identifier.advData.serviceData.hasOwnProperty('minew')) {
        var sensor = event.tiraid.identifier.advData.serviceData.minew;
        var aX = sensor.accelerationX;
        var aY = sensor.accelerationY;
        var norm = (aX * aX) + (aY * aY);
        var nX = aX / norm;
        var nY = aY / norm;
        $scope.deviceId = event.deviceId;
        $scope.orientation = ['', '', '', '', '', '', '', ''];

        if(nY > 0.924) {
          $scope.orientation[1] = 'orientation-box-selected'; // Up
        }
        else if(nY > 0.383) {
          if(nX > 0) {
            $scope.orientation[0] = 'orientation-box-selected'; // Up left
          }
          else {
            $scope.orientation[2] = 'orientation-box-selected'; // Up right
          }
        }
        else if(nY > -0.383) {
          if(nX > 0) {
            $scope.orientation[7] = 'orientation-box-selected'; // Left
          }
          else {
            $scope.orientation[3] = 'orientation-box-selected'; // Right
          }
        }
        else if(nY > -0.924) {
          if(nX > 0) {
            $scope.orientation[6] = 'orientation-box-selected'; // Down left;
          }
          else {
            $scope.orientation[4] = 'orientation-box-selected'; // Down right
          }
        }
        else {
          $scope.orientation[5] = 'orientation-box-selected'; // Down
        }
      }
      $scope.$apply();
    }

    // Connect to a websocket with the given url and optional token
    $scope.connect = function(url, token) {
      var options = {};
      if(token && (typeof(token) === 'string')) {
        options.query = { token: token };
      }
      socket = io.connect(url, options);
      beaver.listen(socket);
      socket.on('connect', function() {
        $scope.connectionMessage = 'Connected to ' + url;
        $scope.displayConnection = false;
        $scope.connected = true;
        $scope.$apply();
      });
    };

    

  });
