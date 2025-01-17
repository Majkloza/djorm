const { getModelName } = require('../models/ModelRegistry')
const { Transform } = require('stream')

class DatabaseMapper extends Transform {
  static parseFieldName (fieldName, prefix) {
    if (fieldName.startsWith(prefix)) {
      return fieldName.substr(prefix.length)
    } else if (!fieldName.includes('__')) {
      return fieldName
    }
    return null
  }

  static createMapper = Model => {
    if (!Model) {
      return null
    }
    const prefix = `${getModelName(Model)}__`
    return item => {
      const inst = new Model()
      const entries = Object.entries(item)
      for (const [fieldName, fieldValue] of entries) {
        const fieldNameStripped = this.parseFieldName(fieldName, prefix)
        if (fieldNameStripped) {
          try {
            inst.setFromDb(fieldNameStripped, fieldValue)
          } catch (e) {
            // Avoid killing mapper by parsing errors
            inst.set(fieldNameStripped, null)
            // @TODO: Warn about this error!
          }
        }
      }
      return inst
    }
  }

  constructor (qs) {
    super({ readableObjectMode: true, writableObjectMode: true })
    this.map = this.constructor.createMapper(qs.model)
  }

  _transform (item, enc, next) {
    this.push(this.map ? this.map(item) : item)
    next()
  }
}

module.exports = {
  DatabaseMapper
}
