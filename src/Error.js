class LoaderError extends Error {
  constructor (err) {
    super(err)

    this.name = 'HTML Loader'
    this.message = `\n\n${err.message}\n`

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = LoaderError
