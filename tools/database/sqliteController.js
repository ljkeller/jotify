const {
  countInmatesOnDate,
  getCompressedInmateDataForDate,
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
    await createTables(this.#db);
  }

  async serializeInmateAggregate(inmate) {
    await serializeInmateAggregate(this.#db, inmate);
  }

  async countInmatesOnDate(iso8601DateStr) {
    return await countInmatesOnDate(this.#db, iso8601DateStr);
  }

  async getCompressedInmateDataForDate(iso8601DateStr, sortConfig = null) {
    return await getCompressedInmateDataForDate(
      this.#db,
      iso8601DateStr,
      sortConfig
    );
  }
}
// TODO: Finish adding methods
module.exports = SqliteController;
