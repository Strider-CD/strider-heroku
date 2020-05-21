const fs = require('fs');
const superagent = require('superagent');
const execa = require('execa');
const tmp = require('tmp-promise');

const API = 'https://api.heroku.com';

module.exports = {
  getApps: getApps,
  addKey: addKey,
};

function getApps(aid, token, done) {
  superagent
    .get(API + '/apps')
    .set('Accept', 'application/vnd.heroku+json; version=3')
    .set('Authorization', 'Bearer ' + token)
    .end(function (err, res) {
      if (err) {
        return done(err);
      }

      if (res.status !== 200)
        return done(new Error('Status: ' + res.status + '; ' + res.text));
      done(
        null,
        res.body.map(function (app) {
          return {
            id: app.id,
            name: app.name,
            account: aid,
            git_url: app.git_url,
            web_url: app.web_url,
            updated_at: app.updated_at,
          };
        })
      );
    });
}

async function addKey(key) {
  try {
    let { path, cleanup } = await tmp.file();
    fs.promises.writeFile(path, key);

    await execa('heroku', ['keys:add', path]);
    cleanup();
  } catch (err) {
    throw new Error('failed creating temporary folder: ' + err.message);
  }
}
