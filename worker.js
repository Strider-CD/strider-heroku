
module.exports = {
  init: function (config, job, context, cb) {
    cb(null, {
      deploy: 'echo "heroku deploy"'
    })
  }
}
