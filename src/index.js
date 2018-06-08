const { getOptions } = require('@webpack-utilities/loader')
const { validateOptions } = require('@webpack-utilities/schema')

const posthtml = require('posthtml')
const { urls, imports } = require('@posthtml/esm')
const minifier = require('htmlnano')

const schema = require('./options.json')
const LoaderError = require('./Error.js')

const DEFAULTS = {
  url: true,
  import: true,
  minimize: false,
  template: false,
}

function loader (html, map, meta) {
  const options = Object.assign({}, DEFAULTS, getOptions(this))

  validateOptions(schema, options, 'HTML Loader')

  const cb = this.async()
  const file = this.resourcePath

  options.template = options.template
    ? typeof options.template === 'string' ? options.template : '_'
    : false

  const plugins = []

  // HTML URL Plugin
  if (options.url) {
    plugins.push(urls(options))
  }

  // HTML IMPORT Plugin
  if (options.import) {
    plugins.push(imports(options))
  }

  if (options.minimize) {
    plugins.push(minifier())
  }

  if (meta) {
    if (meta.ast && meta.ast.type === 'posthtml') {
      const { ast } = meta.ast

      html = ast.root
    }
  }

  posthtml(plugins)
    .process(html, { from: file, to: file })
    .then(({ html, messages }) => {
      if (meta && meta.messages) {
        messages = messages.concat(meta.messages)
      }

      const imports = messages
        .filter((msg) => (msg.type === 'import' ? msg : false))
        .reduce((imports, msg) => {
          try {
            msg = typeof msg.import === 'function'
              ? msg.import()
              : msg.import

            imports += msg
          } catch (err) {
            // TODO(michael-ciniawsky)
            // revisit HTMLImportError
            this.emitError(err)
          }

          return imports
        }, '')

      const exports = messages
        .filter((msg) => (msg.type === 'export' ? msg : false))
        .reduce((exports, msg) => {
          try {
            msg = typeof msg.export === 'function'
              ? msg.import()
              : msg.import

            exports += msg
          } catch (err) {
            // TODO(michael-ciniawsky)
            // revisit HTMLExportError
            this.emitError(err)
          }

          return exports
        }, '')

      html = options.template
        ? `function (${options.template}) { return \`${html}\` }`
        : `\`${html}\``

      const result = [
        imports ? `// HTML Imports\n${imports}\n` : false,
        exports ? `// HTML Exports\n${exports}\n` : false,
        `// HTML\nexport default ${html}`,
      ]
        .filter(Boolean)
        .join('\n')

      cb(null, result)

      return null
    })
    .catch((err) => {
      cb(new LoaderError(err))

      return null
    })
}

module.exports = loader
