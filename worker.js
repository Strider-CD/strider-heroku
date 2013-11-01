
var git = require('strider-git/lib')

module.exports = {
  init: function (userConfig, config, job, context, cb) {
    var account
    for (var i=0; i<userConfig.accounts.length; i++) {
      if (userConfig.accounts[i].id === config.app.account) {
        account = userConfig.accounts[i]
        break;
      }
    }
    if (!account) return cb(new Error('Heroku invalid configuration. Account not found'))
    cb(null, {
      deploy: function (context, done) {
        var cmd = 'git push ' + config.app.git_url + ' ' + context.branch + ':master'
        git.gitaneCmd(cmd, context.dataDir, account.privkey, context, done)
      }
    })
  }
}
