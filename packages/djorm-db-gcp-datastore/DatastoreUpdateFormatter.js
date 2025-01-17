const { DatastoreFormatterBase } = require('./DatastoreFormatterBase')

class DatastoreUpdateFormatter extends DatastoreFormatterBase {
  formatQuery (qs) {
    return async () => await this.db.upsert(this.formatValues(qs))
  }
}

module.exports = { DatastoreUpdateFormatter }
