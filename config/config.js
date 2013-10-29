
app.controller('HerokuController', ['$scope', '$element', function ($scope, $element) {
  $scope.$watch('userConfigs.heroku', function (value) {
    if (!value) return
    $scope.userConfig = value;
    if (!$scope.account && value.accounts.length > 0) {
      $scope.account = value.accounts[0];
    }
  });
  $scope.$watch('configs[branch.name].heroku.config', function (value) {
    $scope.config = value;
    if (value.app && $scope.userConfig.accounts) {
      for (var i=0; i<$scope.userConfig.accounts.length; i++) {
        if ($scope.userConfig.accounts[i].id === value.app.account) {
          $scope.account = $scope.userConfig.accounts[i];
          break;
        }
      }
    }
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

