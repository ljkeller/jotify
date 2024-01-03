import Database from 'better-sqlite3';

import LikeButton from './like-button';
import Inmate from '../tools/models/Inmate';
import { tables } from '../tools/config';

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function HomePage() {
  const db = new Database('jotify.db', { verbose: console.log, readonly: true });

  const inmateQuery = db.prepare(`SELECT id, first_name, middle_name, last_name, age, booking_date, arresting_agency, charges, url FROM ${tables.inmates} LIMIT 10;`).all();
  const inmates = inmateQuery.map((inmate) => ({ id: inmate.id, inmate: new Inmate(inmate.first_name, inmate.middle_name, inmate.last_name, inmate.age, inmate.booking_date, inmate.arresting_agency, inmate.charges, null, inmate.url, []) }));

  db.close();

  return (
    <div>
      <Header title="Jotify.io, the Scott County inmate library" />
      <ol>
        {inmates.map((inmate_id_pair) => (
          <li key={inmate_id_pair.id}>{JSON.stringify(inmate_id_pair.inmate)}</li>
        ))}
      </ol>
      <LikeButton />
    </div>
  );
}