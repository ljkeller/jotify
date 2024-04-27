var SqlFactory = function () {
  this.getSqlConnection = function (dbName, dbpath = "", options = {}) {
    if (dbName === "sqlite") {
      const sqlite = require("better-sqlite3");
      const db = new sqlite.Database(dbpath, options);
      return db;
    } else if (dbName === "postgres") {
      const { psql } = require("./postgreSqlUtils");
      return psql;
    }

    throw new Error(
      `Database type ${dbName} not supported. Supported types are 'sqlite' and 'postgres'`
    );
  };
};

module.exports = SqlFactory;
