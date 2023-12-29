const axios = require("axios");
const cheerio = require("cheerio");
const sqlite3 = require("sqlite3").verbose();

const todayInmatesUrl = "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today";
// Requires appending date in format MM/DD/YY
const datelessInmatesUrl = "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=";

const sleepBetweenRequests = 50; // ms
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

function getLast7DaysLocal() {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Format the date as 'MM/DD/YY'
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
        const year = String(date.getFullYear()).slice(-2); // Get last two digits

        const formattedDate = `${month}/${day}/${year}`;
        dates.push(formattedDate);
    }
    console.log("Last 7 days: ", dates);

    return dates;
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

    return new Inmate(firstName, middleName, lastName, age, bookingDate, releaseDate, arrestingAgency, charges, imgUrl);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getInmatesForDates(dateArr) {
    let inmates = [];

    for (const date of dateArr) {
        const url = datelessInmatesUrl + date;
        const inmatesForDate = await getInmates(url);
        inmates = inmates.concat(inmatesForDate);

        await sleep(sleepBetweenRequests);
    }

    return inmates;
}

async function getInmates(inmateUrl) {
    return new Promise((resolve) => {
        const inmates = [];
        axios.get(inmateUrl).then(response => {
            const html = response.data;

            const $ = cheerio.load(html);

            console.log("Parsing inmates...");
            const header_row = 0;

            $(".inmates-table tr").each((idx, elem) => {
                if (idx === header_row) return;

                const td = $(elem).find("td");
                let inmate = parseInmateTd($, td);
                inmates.push(inmate);
            });
            console.log("Inmates size: ", inmates.length);
            resolve(inmates);
        });
    });
}

async function main() {
    let last7Days = getLast7DaysLocal();
    let last7DaysInmates = await getInmatesForDates(last7Days);
    console.log(last7DaysInmates);
    console.log(last7DaysInmates.length);
    // const db = new sqlite3.Database(":memory:");

    // try {
    //     const inmates = await getInmates(todayInmatesUrl);
    //     db.serialize(() => {
    //         db.run(`
    //         CREATE TABLE IF NOT EXISTS Inmates (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             firstName TEXT,
    //             middleName TEXT,
    //             lastName TEXT,
    //             age INTEGER,
    //             bookingDate TEXT,
    //             releaseDate TEXT,
    //             arrestingAgency TEXT,
    //             charges TEXT,
    //             imgUrl TEXT
    //         )
    //     `
    //         );
    //         const stmt = db.prepare(`
    //             INSERT INTO Inmates 
    //             VALUES
    //             (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    //         );
    //         inmates.forEach(inmate => {
    //             stmt.run(
    //                 inmate.firstName,
    //                 inmate.middleName,
    //                 inmate.lastName,
    //                 inmate.age,
    //                 inmate.bookingDate,
    //                 inmate.releaseDate,
    //                 inmate.arrestingAgency,
    //                 inmate.charges,
    //                 inmate.imgUrl
    //             );
    //             console.log("Inserting inmate: ", inmate);
    //         });
    //         stmt.finalize();
    //     });

    // } catch (err) {
    //     console.log(err);
    // } finally {
    //     db.close();
    //     console.log("Finished building db.");
    // }
}

main();