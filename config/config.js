
app.controller('HerokuController', ['$scope', '$element', function ($scope, $element) {
  $scope.$watch('userConfigs.heroku', function (value) {
    $scope.userConfig = value;
  });
  $scope.$watch('configs[branch.name].heroku.config', function (value) {
    $scope.config = value;
  });
  $scope.saving = false;
  $scope.save = function () {
    $scope.saving = true;
    $scope.pluginConfig('heroku', $scope.config, function () {
      $scope.saving = false;
    });
  };
  $scope.getApps = function () {
    if (!$scope.account) return console.warn('tried to getApps but no account');
    $.ajax('/ext/heroku/apps/' + $scope.account.id, {
      type: 'GET',
      success: function (body, req) {
        $scope.account.cache = body;
        $scope.success('Got accounts list for ' + $scope.account.email, true);
      },
      error: function () {
        $scope.error('Failed to get accounts list for ' + $scope.account.email, true);
      }
    });
  };
}]);

