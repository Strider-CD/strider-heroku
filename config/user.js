
app.controller('HerokuUserController', ['$scope', '$element', function ($scope, $element) {
  $scope.$watch('user.jobplugins.heroku', function (value) {
    $scope.config = value;
  });
  $scope.remove = function (account) {
    $.ajax('/ext/heroku/account/' + account.id, {
      type: 'DELETE',
      success: function () {
        $scope.config.accounts.splice($scope.config.accounts.indexOf(account), 1);
        $scope.success('Removed account', true);
      },
      error: function () {
        $scope.error('Failed to remove account', true);
      }
    });
  };
}]);
