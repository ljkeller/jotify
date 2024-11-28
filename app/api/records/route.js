import SqlControllerFactory from '/tools/database/sqlControllerFactory';
import { runtimeDbConfig } from '/tools/config';

export const revalidate = 900;

const RECORD_QUERY_LIMIT = 25;

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

    console.log(`retrieved ${compressedRecords.length} records for page ${pageOffset}`);
    console.log(compressedRecords.slice(0,5));
    return Response.json({compressedRecords});
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }),
      {
        status: 500
      });
  }
}
