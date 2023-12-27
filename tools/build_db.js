const axios = require("axios");
const cheerio = require("cheerio");

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

axios.get(todayInmatesUrl).then(response => {
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
