const loader = require('../src/index.js')
const webpack = require('@webpack-utilties/test')

describe('Errors', () => {
  test('Loader Error', async () => {
    const config = {
      loader: {
        test: /\.html$/,
        options: {
          minimize: true      
        }
      }
    }

    const stats = await webpack('error.js', config)
    const { source } = stats.toJson().modules[1]

    // eslint-disable-next-line
    const err = () => eval(source)

    expect(err).toThrow()
    expect(err).toThrowErrorMatchingSnapshot()
  })

  test('Validation Error', async () => {
    const config = {
      loader: {
        test: /\.html$/,
        options: {
          template: 1
        }
      }
    }

    const stats = await webpack('error.js', config)
    const { errors } = stats.toJson()

    errors.forEach((error) => expect(error).toMatchSnapshot())
  })
})
