const { Transform } = require('stream')
const PluginError = require('plugin-error')
const replaceExtension = require('replace-ext')

const PLUGIN_NAME = 'gulp-vinylson'

const defaultOptions = {
  ext: '.json'
}

module.exports = (options = {}) =>
{

  options = {
    ...defaultOptions,
    ...options
  }

  return new Transform({
    objectMode: true,
    transform(file, enc, callback)
    {
      if (file.isNull())
      {
        return callback(null, file)
      }

      if (file.isStream())
      {
        return callback(new PluginError(PLUGIN_NAME, 'Streaming is not supported'))
      }

      if (file.isBuffer())
      {
        file.path = replaceExtension(file.path, options.ext)

        const result = file.page
        result['body'] = file.contents
        file.contents = Buffer.from(JSON.stringify(result))
        return callback(null, file)
      }

      return null
    }
  })
}
