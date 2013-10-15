
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
  $scope.newKeys = function () {
    if (!$scope.config.app) return console.warn('Tried to newKeys but no app');
    $.ajax('/' + $scope.project.name + '/ext/heroku/keygen', {
      type: 'POST',
      success: function (body) {
        $scope.config.privkey = body.privkey;
        $scope.config.pubkey = body.pubkey;
        $scope.success('Generated new keys and pushed them to heroku. You are ready to deploy!', true);
      },
      error: function () {
        $scope.error('Error generating new keys', true);
      }
    });
  };
  $scope.keysToHeroku = function () {
    if (!$scope.config.app) return console.error('tried to push keys to heroku, but no app');
    $.ajax('/' + $scope.project.name + '/ext/heroku/pushkeys', {
      type: 'POST',
      success: function () {
        $scope.success('Keys pushed to heroku. You are ready to deploy!', true);
      },
      error: function () {
        $scope.error('Failed to push keys to heroku', true);
      }
    });
  };
}]);

