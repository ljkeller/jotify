import SqlControllerFactory from '/tools/database/sqlControllerFactory';

import { runtimeDbConfig } from '/tools/config';

export const dynamic = 'force-dynamic';

export async function GET(request) {
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
    const db = new SqlControllerFactory().getSqlConnection(runtimeDbConfig);
    const relatedNames = searchType === 'name' ?
      await db.getRelatedNamesFuzzy(searchQuery) :
      await db.getRelatedAliases(searchQuery);

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
