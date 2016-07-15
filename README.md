# Heroku Deploys with strider

There's a lot that needs to be done here. See the [strider-extension-loader
Readme](https://github.com/Strider-CD/strider-extension-loader/tree/1_4_refactor)
for info on the api (under "job plugins").


# Important config!

To use on **anything other than localhost:3000**, you need to register your own **Heroku API client**, at https://dashboard.heroku.com/account. See [this docs page](https://devcenter.heroku.com/articles/oauth) for more info.

This is a screenshot of what you will see on your dashboard:

![screenshot](docs/heroku_api_key.png)

# Configuring Strider to use your Heroku API Client
Once you have your `HEROKU_OAUTH_ID` and `HEROKU_OAUTH_SECRET`, you must configure Strider to use them like this:

`heroku config:add PLUGIN_HEROKU_CLIENT_ID=<CLIENT_ID_FROM_HEROKU> PLUGIN_HEROKU_CLIENT_SECRET=<CLIENT_SECRET_FROM_HEROKU>`
