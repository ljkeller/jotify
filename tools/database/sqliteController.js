const {
  countInmatesOnDate,
  getInmateAggregateData,
  getCompressedInmateDataForDate,
  getCompressedInmateDataForSearchName,
  getCompressedInmateDataForAlias,
  setupDbCloseConditions,
  createTables,
  serializeInmateAggregate,
} = require("./sqliteUtils");

// This class offers a strategy pattern abstraction over the SQL interface
class SqliteController {
  #db;
  constructor(db) {
    this.#db = db;
  }

  setupDbCloseConditions() {
    setupDbCloseConditions(this.#db);
  }

  async createTables() {
    createTables(this.#db);
  }

  async serializeInmateAggregate(inmate) {
    serializeInmateAggregate(this.#db, inmate);
  }

  async countInmatesOnDate(iso8601DateStr) {
    return countInmatesOnDate(this.#db, iso8601DateStr);
  }

  async getCompressedInmateDataForDate(iso8601DateStr, sortConfig = null) {
    return getCompressedInmateDataForDate(this.#db, iso8601DateStr, sortConfig);
  }

  async getCompressedInmateDataForSearchName(name, sortConfig = null) {
    return getCompressedInmateDataForSearchName(this.#db, name, sortConfig);
  }

  async getCompressedInmateDataForAlias(alias, sortConfig = null) {
    return getCompressedInmateDataForAlias(this.#db, alias, sortConfig);
  }

  async getInmateAggregateData(id = null) {
    return getInmateAggregateData(this.#db, id);
  }
}
// TODO: Finish adding methods
module.exports = SqliteController;
