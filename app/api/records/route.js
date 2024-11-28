import SqlControllerFactory from '/tools/database/sqlControllerFactory';
import { runtimeDbConfig } from '/tools/config';
import { RECORD_QUERY_LIMIT } from '/tools/config';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // I don't want to support custom limits, so I'll just hardcode the offset logic
    // This way, clients can only request a small sequence of data at a time
    const pageOffset = searchParams.get('page');

    if (!pageOffset || pageOffset < 0) {
      return new Response(JSON.stringify({ error: `need to supply 'page' search param with valid, non-negative value to retrieve sequence of records.` }),
        {
          status: 400
        });
    }
    const offset = pageOffset * RECORD_QUERY_LIMIT;
    const db = new SqlControllerFactory().getSqlConnection(runtimeDbConfig);
    const compressedRecords = await db.getCompressedInmateDataSignedImurls(RECORD_QUERY_LIMIT, offset);

    return Response.json(compressedRecords);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }),
      {
        status: 500
      });
  }
}
