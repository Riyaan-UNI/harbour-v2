/* Land Registry owner lookup.
   Default provider is `mock` and returns no owner data, which is the honest
   default: the service reports that it could not verify rather than guessing. */

const LAND_REGISTRY_SEARCH = "https://www.ird.gov.hk/eng/faq/lr.htm";
const LAND_SEARCH_PORTAL = "https://www.gov.hk/en/residents/housing/land/";

function provider() {
  return (process.env.LAND_PROVIDER || "mock").toLowerCase();
}

export async function lookupOwner({ landlordName = "", address = "" } = {}) {
  if (provider() !== "mock") {
    return { found: false, source: provider(), verifyUrl: LAND_SEARCH_PORTAL, note: "Live land search is not enabled yet." };
  }
  return {
    found: false,
    source: "mock",
    queried: { landlordName: landlordName.trim(), address: address.trim() },
    verifyUrl: LAND_SEARCH_PORTAL,
    registryUrl: LAND_REGISTRY_SEARCH,
    note: "Harbour could not verify ownership. Run an official land search before paying a deposit.",
  };
}
