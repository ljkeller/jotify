const axios = require("axios");
const cheerio = require("cheerio");
const sqlite3 = require("sqlite3").verbose();

const todayInmatesUrl = "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today";
class Inmate {
    constructor(firstName, middleName, lastName, age, bookingDate, releaseDate, arrestingAgency, charges, imgUrl) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.age = age;
        this.bookingDate = bookingDate;
        this.releaseDate = releaseDate;
        this.arrestingAgency = arrestingAgency;
        this.charges = charges;
        this.imgUrl = imgUrl;
    }
}

function splitName(fullName) {
    const parts = fullName.split(" ");
    let firstName, middleName, lastName;

    if (parts.length === 3) {
        [lastName, firstName, middleName] = parts;
    } else {
        lastName = parts[0];
        firstName = parts[1];
        middleName = parts.slice(2).join(" ");
    }

    return { firstName, middleName, lastName };
}

function parseInmateTd($, td) {
    // Example row:
    // <tr>
    //     <th>Inmate Name (last, first, middle)</th>
    //     <th>Age</th>
    //     <th>Booking Date Time</th>
    //     <th>Release Date Time</th>
    //     <th>Arresting Agency</th>
    //     <th>Charges</th>
    // </tr>

    const fullname = $(td[0]).text().trim();
    const { firstName, middleName, lastName } = splitName(fullname);

    let imgUrl = $(td[0]).find("img").attr("src");
    if (imgUrl && imgUrl.startsWith("//")) {
        imgUrl = "https:" + imgUrl;
    }

    const age = $(td[1]).text().trim();
    const bookingDate = $(td[2]).text().trim();
    const releaseDate = $(td[3]).text().trim();
    const arrestingAgency = $(td[4]).text().trim();
    const charges = $(td[5]).text().trim();

    let inmate = new Inmate(firstName, middleName, lastName, age, bookingDate, releaseDate, arrestingAgency, charges, imgUrl);
    console.log("Created: ", inmate);

    return inmate;
}

async function buildDb(db) {
    return new Promise((resolve, reject) => {
        // need to build this async logic correctly for the db to be built correctly
        axios.get(todayInmatesUrl).then(response => {
            const html = response.data;

            const $ = cheerio.load(html);

            console.log($);

            console.log("Parsing inmates...");
            const header_row = 0;

            const stmt = db.prepare(`
                INSERT INTO Inmates 
                VALUES
                (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );

            $(".inmates-table tr").each((idx, elem) => {
                if (idx === header_row) return;

                const td = $(elem).find("td");
                let inmate = parseInmateTd($, td);

                stmt.run(
                    inmate.firstName,
                    inmate.middleName,
                    inmate.lastName,
                    inmate.age,
                    inmate.bookingDate,
                    inmate.releaseDate,
                    inmate.arrestingAgency,
                    inmate.charges,
                    inmate.imgUrl
                );
            });
            stmt.finalize();
        });
    });
}

async function main() {
    const db = new sqlite3.Database(":memory:");

    try {
        await new Promise((resolve, reject) => {

            db.serialize(() => {
                db.run(`
            CREATE TABLE IF NOT EXISTS Inmates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT,
                middleName TEXT,
                lastName TEXT,
                age INTEGER,
                bookingDate TEXT,
                releaseDate TEXT,
                arrestingAgency TEXT,
                charges TEXT,
                imgUrl TEXT
            )
        `);
                resolve();
            });
        });
        await buildDb(db);

    } catch (err) {
        console.log(err);
    } finally {
        db.close();
    }
}

main();