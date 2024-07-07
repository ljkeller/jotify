const {
  countInmatesOnDate,
  getInmateAggregateData,
  getCompressedInmateDataForDate,
  getCompressedInmateDataForSearchName,
  getCompressedInmateDataForAlias,
  getRecommendedRelatedInmates
} = require("./postgreSqlUtils");

// This class offers a strategy pattern abstraction over the SQL interface
class PostgreSqlController {
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

  async getCompressedInmateDataForSearchName(name, sortConfig = null) {
    return await getCompressedInmateDataForSearchName(
      this.#db,
      name,
      sortConfig
    );
  }

  async getCompressedInmateDataForAlias(alias, sortConfig = null) {
    return await getCompressedInmateDataForAlias(this.#db, alias, sortConfig);
  }

  async getInmateAggregateData(id = null) {
    return await getInmateAggregateData(this.#db, id);
  }

  async getRecommendedRelatedInmates(id) {
    return await getRecommendedRelatedInmates(this.#db, id);
  }
}

// TODO:
//   getInmateIdsWithNullImages,
//   getCompressedInmateDataForAlias,
//   getRelatedNames,
//   getRelatedAliases,
//   getClient,
//   end,

module.exports = PostgreSqlController;
