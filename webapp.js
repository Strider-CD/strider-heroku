const HerokuStrategy = require('passport-heroku').Strategy;
const keypair = require('ssh-keypair');
const api = require('./lib/api');

module.exports = {
  appConfig: {
    clientId: 'da7ad270-b5e6-4bdb-8bbc-a6cad9939394',
    clientSecret: '535b0928-8a79-4a65-b204-3e2795ea768a',
  },
  userConfig: {
    accounts: [
      {
        id: String,
        token: String,
        api_key: String, // backwards compat
        email: String,
        privkey: String,
        pubkey: String,
        // list of the apps
        cache: [
          {
            id: String,
            name: String,
            account: String,
            git_url: String,
            web_url: String,
            updated_at: String,
          },
        ],
      },
    ],
  },
  config: {
    app: {
      id: String,
      name: String,
      account: String,
      git_url: String,
      web_url: String,
      updated_at: String,
    },
  },

  auth: function (passport, context) {
    var config = this.appConfig;
    if (!config.clientId || !config.clientSecret) {
      throw new Error(
        'Heroku plugin misconfigured. client_id and client_secret required'
      );
    }
    passport.use(
      new HerokuStrategy(
        {
          clientID: config.clientId,
          clientSecret: config.clientSecret,
          passReqToCallback: true,
          scope: ['global'],
          callbackURL:
            context.config.server_name + '/ext/heroku/oauth/callback',
        },
        validateAuth
      )
    );
  },

  globalRoutes: function (app, context) {
    app.get(
      '/oauth',
      context.auth.requireUser,
      function (req, res, next) {
        req.session.heroku_auth_redirect =
          req.query.redirect || '/account#heroku';
        next();
      },
      context.passport.authenticate('heroku')
    );
    app.get(
      '/oauth/callback',
      context.passport.authenticate('heroku', {
        failureRedirect: '/account#heroku',
      }),
      function (req, res) {
        // Successful authentication, redirect home.
        res.redirect(req.session.heroku_auth_redirect || '/account#heroku');
      }
    );

    app.get('/apps/:id', function (req, res) {
      var config = req.user.jobPluginData('heroku') || {};
      if (!config || !config.accounts)
        return res.send(404, 'Account not found');
      var account;
      for (var i = 0; i < config.accounts.length; i++) {
        if (config.accounts[i].id === req.params.id) {
          account = config.accounts[i];
          break;
        }
      }
      if (!account) return res.send(404, 'Account not found');
      api.getApps(account.id, account.token, function (err, apps) {
        if (err)
          return res.send(500, 'failed to get apps from api: ' + err.message);
        account.cache = apps;
        req.user.markModified('jobplugins');
        req.user.save(function (err) {
          if (err) return res.send(500, 'Failed to save user');
          res.send(apps);
        });
      });
    });

    app.del('/account/:id', function (req, res) {
      var config = req.user.jobPluginData('heroku') || {};
      if (!config || !config.accounts)
        return res.send(404, 'Account not found');
      var account;
      for (var i = 0; i < config.accounts.length; i++) {
        if (config.accounts[i].id === req.params.id) {
          account = config.accounts[i];
          break;
        }
      }
      if (!account) return res.send(404, 'Account not found');
      context.models.Project.update(
        {
          'branches.plugins': {
            $elemMatch: {
              id: 'heroku',
              'config.app.account': account.id,
            },
          },
        },
        {
          $pull: { 'branches.$.plugins': { id: 'heroku' } },
        },
        function (err) {
          if (err) return res.send(500, 'Failed to update projects');
          config.accounts.splice(i, 1);
          req.user.markModified('jobplugins');
          req.user.save(function (err) {
            if (err) return res.send(500, 'Failed to save user');
            res.send(204);
          });
        }
      );
    });
  },
};

function validateAuth(req, token, refresh, profile, done) {
  var heroku = req.user.jobPluginData('heroku') || {};
  if (!heroku.accounts) heroku.accounts = [];
  for (var i = 0; i < heroku.accounts.length; i++) {
    if (heroku.accounts[i].id === profile.id) {
      return done(null, req.user);
    }
  }
  api.getApps(profile.id, token, function (err, apps) {
    if (err) {
      return done(new Error('failed to retrieve apps list: ' + err.message));
    }

    keypair(profile.email + ' - strider', function (err, priv, pub) {
      if (err) {
        return done(new Error('Failed to generate keypair; ' + err.message));
      }

      api
        .addKey(pub)
        .then(() => {
          profile.emails.forEach((item) => {
            heroku.accounts.push({
              id: profile.id,
              token: token,
              email: item.value,
              privkey: priv,
              pubkey: pub,
              cache: [apps],
            });
          });
          req.user.jobPluginData('heroku', heroku, function (err) {
            done(err, req.user);
          });
        })
        .catch((err) => {
          return done(new Error('Failed to add ssh key: ' + err.message));
        });
    });
  });
}
