const postgres = require('postgres');
const { postgresConfig } = require('./secrets.js');

const sql = postgres(`postgres://${postgresConfig.username}:${postgresConfig.password}@${postgresConfig.ip}:${postgresConfig.port}`);

async function main() {
  // Create a tmp table
  await sql`
    CREATE TABLE IF NOT EXISTS fake_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      age INT
    )
  `;

  // Add some data to the table
  await sql`
    INSERT INTO fake_table (name, age)
    VALUES ('John', 25), ('Jane', 30), ('Bob', 35)
  `;

  // Query and print the data
  const data = await sql`
    SELECT * FROM fake_table
  `;
  console.log(data);

  sql.end();
  return;
}

main();

// console.log(sql);