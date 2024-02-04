import Database from 'better-sqlite3';

import { config } from '/tools/config';
import { getRelatedInmateNames } from "../../../tools/database/sqliteUtils";

export function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('query');

    if (!searchQuery) {
      return new Response(JSON.stringify({ error: 'Missing query parameter' }),
        {
          status: 400
        });
    }
    // TODO! sanitize searchQuery
    const db = new Database(config.appReadFile, { verbose: console.log, readonly: true });
    const inmateNames = getRelatedInmateNames(db, searchQuery);
    db.close();

    return new Response(JSON.stringify(inmateNames),
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