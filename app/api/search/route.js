import Database from 'better-sqlite3';

import { config } from '/tools/config';
import { getRelatedAliases, getRelatedNames } from "../../../tools/database/sqliteUtils";

export function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('query');
    const searchType = searchParams.get('type');

    if (!searchQuery || !searchType) {
      return new Response(JSON.stringify({ error: `Missing query parameter: ${!searchQuery ? 'query' : 'type'}` }),
        {
          status: 400
        });
    }
    const db = new Database(config.appReadFile, { verbose: config.printDbQueries ? console.log : null, readonly: true });
    const relatedNames = searchType === 'name' ? getRelatedNames(db, searchQuery) : getRelatedAliases(db, searchQuery);
    db.close();

    return new Response(JSON.stringify(relatedNames),
      {
        status: 200
      });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }),
      {
        status: 500
      });
  }
}