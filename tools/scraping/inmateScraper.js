const axios = require("axios");
const cheerio = require("cheerio");
const Inmate = require("../models/Inmate");

const config = require("../config");

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

    // TODO! We really should crawl the inmate page to get the official inmate name
    const fullname = $(td[0]).text().trim();
    const { firstName, middleName, lastName } = splitName(fullname);

    let imgUrl = $(td[0]).find("img").attr("src");
    if (imgUrl && imgUrl.startsWith("//")) {
        imgUrl = "https:" + imgUrl;
    }

    let inmateUrl = $(td[0]).find("a").attr("href");
    if (inmateUrl && inmateUrl.startsWith("?")) {
        // Dont duplicate '?' from href
        inmateUrl = config.baseInmateLink + inmateUrl.slice(1);
    }

    const age = $(td[1]).text().trim();
    const bookingDate = $(td[2]).text().trim();
    const releaseDate = $(td[3]).text().trim();
    const arrestingAgency = $(td[4]).text().trim();
    const charges = $(td[5]).text().trim();

    return new Inmate(firstName, middleName, lastName, age, bookingDate, releaseDate, arrestingAgency, charges, imgUrl, inmateUrl);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getInmatesForDates(dateArr) {
    let inmates = [];

    for (const date of dateArr) {
        const url = config.datelessInmatesUrl + date;
        const inmatesForDate = await getInmates(url);
        inmates = inmates.concat(inmatesForDate);

        await sleep(config.sleepBetweenRequests);
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

module.exports = { getInmatesForDates, getInmates };