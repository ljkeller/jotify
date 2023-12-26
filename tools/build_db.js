const axios = require("axios");
const cheerio = require("cheerio");

const today_inmates_url = "https://www.scottcountyiowa.us/sheriff/inmates.php?comdate=today";

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

axios.get(today_inmates_url).then(response => {
    const html = response.data;

    const $ = cheerio.load(html);
    const inmates = [];

    console.log($);

    console.log("Parsing inmates...");
    const header_row = 0;
    $(".inmates-table tr").each((idx, elem) => {
        if (idx === header_row) return;

        const td = $(elem).find("td");
        let inmate = parseInmateTd($, td);

        inmates.push(inmate);
    });

    console.log(inmates.length);
});

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
    const age = $(td[1]).text();
    const bookingDate = $(td[2]).text();
    const releaseDate = $(td[3]).text();
    const arrestingAgency = $(td[4]).text();
    const charges = $(td[5]).text();

    let inmate = new Inmate(firstName, middleName, lastName, age, bookingDate, releaseDate, arrestingAgency, charges);
    console.log("Created: ", inmate);

    return inmate;
}
