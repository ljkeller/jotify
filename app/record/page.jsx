import Image from "next/image";
import Link from "next/link";

import styles from "/styles/Record.module.css";
import Share from "/app/ui/share";
import { FaMask } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

import { centsToDollars } from "/tools/scraping/currency";
import { config, runtimeDbConfig } from "/tools/config";
import SqlControllerFactory from "/tools/database/sqlControllerFactory";
import { formatISO, format } from "date-fns";

//TODO! Put this in the sqlite controller (dont plan to support embeddings in sqlite)
function getRecommended() {
  return [
    {
      firstLast: "DERRICK GULLEY",
      imgPath: "/in2.jpg",
    },
    {
      firstLast: "GUADALUPE PADAVICH",
      imgPath: "/in3.jpg",
    },
  ];
}

const bufferToBase64 = (buffer) =>
  buffer ? `data:image/jpeg;base64,${buffer.toString("base64")}` : "/anon.png";

export default async function Record({ record, searchParams }) {
  let recommended = [];

  let inmate, inmateId;
  try {
    const factory = new SqlControllerFactory();
    const sqlController = factory.getSqlConnection(runtimeDbConfig);
    recommended.push(await sqlController.getRecommendedRelatedInmates(searchParams?.id ? parseInt(searchParams.id) : null));
    console.log(`recommended: ${JSON.stringify(recommended)}`);
    recommended = await sqlController.getRecommendedRelatedInmates(searchParams?.id ? parseInt(searchParams.id) : null);

    try {
      const searchId = searchParams?.id ? parseInt(searchParams.id) : null;
      ({ inmateAggregate: inmate, inmateId } =
        await sqlController.getInmateAggregateData(searchId));
    } catch (err) {
      console.log(err);
      // TODO: return error page / val
      return <div>Oops, something went wrong</div>;
    }
  } catch (err) {
    // TODO: error handling (code around 500) + styling
    console.log(err);
    return <h1>Oops, something went wrong on our end</h1>;
  }

  let consumerFormatBookingDate;
  try {
    // const bookingDate = parseISO(inmate.inmateProfile.bookingDateIso8601);
    consumerFormatBookingDate = format(
      inmate.inmateProfile.bookingDateIso8601,
      "MMMM d, yyyy 'at' h:mm a"
    );
  } catch (err) {
    console.log("Error parsing booking date: " + err);
    consumerFormatBookingDate = "unknown";
  }

  // TODO: use s3 instead of base64 image
  const image = (
    <img
      src={bufferToBase64(inmate.inmateProfile.imgBlob)}
      width={300}
      height={375}
      alt={`${inmate.inmateProfile.getFullName()} mugshot`}
      className={styles.mugshot}
    />
  );
  // Use below as reference for s3 impl
  // <Image
  //   src='/in1.jpg'
  //   width={300}
  //   height={375}
  //   className={styles.profileImage}
  //   alt='inmate image'
  //   priority={true}
  // ></Image>
  return (
    <div className={styles.recordOuter}>
      <div className={styles.profileSidebar}>
        {image}
        <div className={styles.profileContainer}>
          <h3 className={styles.primaryHeader}>Profile</h3>
          <div className={styles.kvProfile}>
            <div className={styles.kvContainer}>
              <div className={styles.key}>First: </div>
              <div className={styles.value}>{inmate.inmateProfile.first}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Middle: </div>
              <div className={styles.value}>{inmate.inmateProfile.middle}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Last: </div>
              <div className={styles.value}>{inmate.inmateProfile.last}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Affix: </div>
              <div className={styles.value}>{inmate.inmateProfile.affix}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Permanent ID: </div>
              <div className={styles.value}>
                {inmate.inmateProfile.permanentId}
              </div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Sex: </div>
              <div className={styles.value}>{inmate.inmateProfile.sex}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Date of birth: </div>
              <div className={styles.value}>{inmate.inmateProfile.dob}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Height: </div>
              <div className={styles.value}>{inmate.inmateProfile.height}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Weight: </div>
              <div className={styles.value}>{inmate.inmateProfile.weight}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Race: </div>
              <div className={styles.value}>{inmate.inmateProfile.race}</div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Eye Color: </div>
              <div className={styles.value}>
                {inmate.inmateProfile.eyeColor}
              </div>
            </div>
            <div className={styles.kvContainer}>
              <div className={styles.key}>Scott County link: </div>
              <a
                href={config.baseInmateLink + inmate.inmateProfile.scilSysId}
                target="_blank"
                className={`${styles.hiddenLink} ${styles.outLink}`}
              >
                <FiExternalLink /> Go
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.inmateRecordColumn}>
        <div>
          <h1 className={`${styles.inmateName}`}>
            {inmate.inmateProfile.getFullName()}
          </h1>
          <h3 className={`${styles.secondaryHeader}`}>
            Booked:{" "}
            <Link
              title="View inmates on date"
              className={`${styles.hiddenLink} ${styles.recommendedLink}`}
              href={`/date?date=${formatISO(
                inmate.inmateProfile.bookingDateIso8601,
                { representation: "date" }
              )}`}
            >
              {consumerFormatBookingDate}
            </Link>
          </h3>
        </div>
        <div className={styles.aliasHeaderContainer}>
          <div className={styles.iconHeader}>
            <FaMask className={styles.icon} />
            <h3 className={styles.secondaryHeader}>Aliases</h3>
          </div>
          <div className={styles.aliasDivider}>
            {inmate.inmateProfile.aliases.map((alias, idx) => (
              <Link
                href={`/alias?query=${alias}`}
                prefetch={false}
                key={idx}
                className={styles.aliasLink}
              >
                {alias}
              </Link>
            ))}
            {inmate.inmateProfile.aliases.length === 0 ? (
              <div className={styles.noAliases}>No known aliases</div>
            ) : null}
          </div>
        </div>
        <div className={styles.chargeInformation}>
          <h3 className={styles.secondaryHeader}>Charges</h3>
          <table className={styles.inmateTable}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Offense Date</th>
                <th className={styles.tableHeader}>Description</th>
                <th className={styles.tableHeader}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {inmate.chargeInformation.map((charge, index) => (
                <tr className={styles.tableRow} key={index}>
                  <td className={styles.tableData}>{charge.offenseDate}</td>
                  <td className={styles.tableData}>{charge.description}</td>
                  <td className={styles.tableData}>{charge.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.bondInformation}>
          <h3 className={styles.secondaryHeader}>Bond</h3>
          <table className={styles.inmateTable}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Type</th>
                <th className={styles.tableHeader}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {inmate.bondInformation.map((bond, index) => (
                <tr className={styles.tableRow} key={index}>
                  <td className={styles.tableData}>{bond.type}</td>
                  <td className={styles.tableData}>
                    {centsToDollars(bond.amountPennies)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.shareContainer}>
          <Share link={`record?id=${inmateId}`} />
        </div>
      </div>

      <div className={styles.recommendedSidebar}>
        <h2 className={styles.primaryHeader}>Related</h2>
        {recommended.map((inmate, idx) => (
          <div key={idx} className={styles.recommendedContainer}>
            <Image
              className={styles.recommendedImg}
              src={bufferToBase64(inmate.img_data)}
              width={40}
              height={40}
              alt={`${styles.firstLast} img`}
            />
            <Link
              className={`${styles.hiddenLink} ${styles.recommendedLink}`}
              href={`/record?id=${inmate.id}`}
            >
              {inmate.full_name}
            </Link>
          </div>
        ))}
      </div>
    </div >
  );
}
