
var git = require('strider-git/lib')

module.exports = {
  init: function (userConfig, config, job, context, cb) {
    var account
      , err = new Error('Invalid heroku configuration. Account not found')
    if (!userConfig || !config || !config.app || !config.app.account) return cb(err)
    for (var i=0; i<userConfig.accounts.length; i++) {
      if (userConfig.accounts[i].id === config.app.account) {
        account = userConfig.accounts[i]
        break;
      }
    }
    if (!account) return cb(err)
    cb(null, {
      deploy: function (context, done) {
        var cmd = 'git push -f ' + config.app.git_url + ' ' + context.branch + ':master'
         , auth = {
            type: /^http/.test(config.app.git_url) ? 'http': 'ssh'
            , privKey: account.privKey
          }
        git.gitCmd(cmd, context.dataDir, auth, context, done)

      }
    })
  }
}
