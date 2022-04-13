const { Transform } = require('stream')
const PluginError = require('plugin-error')
const replaceExtension = require('replace-ext')

const PLUGIN_NAME = 'gulp-vinylson'

module.exports = (options = {}) =>
{

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
        file.path = replaceExtension(file.path, '.json')

        var get = function (obj, path, def)
        {
          var stringToPath = function (path)
          {
            if (typeof path !== 'string') return path;

            var output = [];
            path.split('.').forEach(function (item)
            {
              output.push(item);
            });

            return output;
          };

          path = stringToPath(path);

          var current = obj;
          for (var i = 0; i < path.length; i++)
          {
            if (!current[ path[ i ] ]) return def;

            current = current[ path[ i ] ];
          }

          return current;
        };

        const result = {}
        for (const [ key, value ] of Object.entries(options))
        {
          let v = get(file, value.property, value.default)
          if (v)
          { 
            result[ key ] = get(value, 'toString', false) ? v.toString() : v 
          }
        }

        file.contents = Buffer.from(JSON.stringify(result))
        return callback(null, file)
      }

      return null
    }
  })
}
