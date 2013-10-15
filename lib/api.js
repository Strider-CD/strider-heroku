
var superagent = require('superagent')
  , API = "https://api.heroku.com"

module.exports = {
  getApps: getApps,
  addKey: addKey
}

function getApps(aid, token, done) {
  superagent.get(API + '/apps')
    .set('Authorization', 'Bearer ' + token)
    .accept('application/vnd.heroku+json')
    .end(function (res) {
      if (res.status !== 200) return done(new Error('Status: ' + res.status + '; ' + res.text))
      done(null, res.body.map(function (app) {
        return {
          id: app.id, 
          name: app.name,
          account: aid,
          git_url: app.git_url,
          web_url: app.web_url,
          updated_at: app.updated_at
        }
      }))
    })
}

function addKey(token, key, done) {
  superagent.post(API + '/account/keys')
    .set('Authorization', 'Bearer ' + token)
    .send({
      public_key: key
    })
    .accept('application/vnd.heroku+json')
    .end(function (res) {
      if (res.status !== 201) return done(new Error('Status: ' + res.status + '; ' + res.text))
      done()
    })
}
  
