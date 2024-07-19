const PostgreSqlController = require("./postgreSqlController");
const SqliteController = require("./sqliteController");

/**
 * Factory for creating sql controllers handling different backends
 * @constructor
 */
var SqlControllerFactory = function() {
  /**
   * Returns a SQL connection based on the provided database configuration.
   * @param {*} dbconfig - The database configuration.
   * @returns {*} sqlController - The polymorphic SQL connection.
   */
  this.getSqlConnection = function(dbconfig) {
    let db = null;
    if (dbconfig.type === "sqlite") {
      const Database = require("better-sqlite3");
      // TODO: Return a singleton for sqlite connections
      db = new Database(dbconfig.file, dbconfig.config);

      return new SqliteController(db);
    } else if (dbconfig.type === "postgres") {
      // Which postgres config we use is determined by config.js
      const { psql } = require("./postgreSqlUtils");
      db = psql;

      return new PostgreSqlController(db);
    }

    throw new Error(
      `Database type ${dbconfig} not supported. Supported types are 'sqliteWritable', 'sqliteReadOnly', 'sqliteMemory', and 'postgresDev'`
    );
  };
};

module.exports = SqlControllerFactory;
