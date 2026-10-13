/* Estate agent licence lookup.
   Default provider is `mock` with seeded demo records so the demo is reliable
   without any external access. A real provider is only added once access is
   confirmed; until then the fallback deep-links the user to the official list. */

const EAA_LICENCE_LIST = "https://www.eaa.org.hk/en-us/Information-Centre/Licence-Search";

const SEEDED_RECORDS = [
  { name: "Cheung Hoi Property", licenceNo: "E-123456", status: "active" },
  { name: "Kowloon Bay Estates", licenceNo: "E-220118", status: "active" },
  { name: "Star Flat Agency", licenceNo: "E-000001", status: "suspended" },
];

function provider() {
  return (process.env.LICENCE_PROVIDER || "mock").toLowerCase();
}

export async function lookupLicence({ agentName = "", licenceNo = "" } = {}) {
  const query = { agentName: agentName.trim(), licenceNo: licenceNo.trim().toUpperCase() };
  if (provider() !== "mock") {
    return { found: false, source: provider(), verifyUrl: EAA_LICENCE_LIST, note: "Live licence lookup is not enabled yet. Check the official list." };
  }
  const match = SEEDED_RECORDS.find(record =>
    (query.licenceNo && record.licenceNo === query.licenceNo) ||
    (query.agentName && record.name.toLowerCase() === query.agentName.toLowerCase()));
  if (!match) {
    return { found: false, source: "mock", verifyUrl: EAA_LICENCE_LIST, note: "No demo record matched. Check the official list before you pay anything." };
  }
  return {
    found: true,
    name: match.name,
    licenceNo: match.licenceNo,
    status: match.status,
    source: "mock",
    verifyUrl: EAA_LICENCE_LIST,
  };
}
