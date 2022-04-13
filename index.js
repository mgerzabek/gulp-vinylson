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
        for (const [ key, entry ] of Object.entries(options))
        {
          let value = get(file, entry.property, entry.default)
          if (value)
          { 
            result[ key ] = get(entry, 'toString', false) ? value.toString() : value 
          }
        }

        file.contents = Buffer.from(JSON.stringify(result))
        return callback(null, file)
      }

      return null
    }
  })
}
