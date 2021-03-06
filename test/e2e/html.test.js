const path = require('path')
const webpack, { dom } = require('@webpack-utilities/test')

describe('E2E', () => {
  test('HTML', async () => {
    const config = {
      rules: [
        {
          test: /\.html$/,
          use: [
            {
              loader: path.resolve('./src'),
              options: {}
            }
          ]
        }
        {
          test: /\.png$/,
          use: [ 'file-loader' ]
        }
      ]
    }

    const stats = await webpack('e2e/html.js', config)
    const { assets } = stats.compilation

    const scripts = {
      main: assets['main.js'].source(),
      runtime: assets['main-runtime.js'].source()
    }

    const { window } = dom([scripts.runtime, scripts.main])

    expect(window.document.body.innerHTML).toMatchSnapshot()
  })
})
