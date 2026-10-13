import { useCallback, useState } from "react";
import { checkRentalListing, getRentalPlaybook, xrayLease } from "../lib/featureApi.js";

const idle = { status: "idle", result: null, error: null };

/** Small hook for Rental Shield. Keeps form state in the page, network state here. */
export function useRentalShield() {
  const [listing, setListing] = useState(idle);
  const [lease, setLease] = useState(idle);
  const [playbook, setPlaybook] = useState({ status: "idle", data: null, error: null });

  const runListingCheck = useCallback(async input => {
    setListing({ status: "loading", result: null, error: null });
    try {
      const result = await checkRentalListing(input);
      setListing({ status: "done", result, error: null });
      return result;
    } catch (error) {
      setListing({ status: "error", result: null, error });
      return null;
    }
  }, []);

  const runLeaseXray = useCallback(async text => {
    setLease({ status: "loading", result: null, error: null });
    try {
      const result = await xrayLease(text);
      setLease({ status: "done", result, error: null });
      return result;
    } catch (error) {
      setLease({ status: "error", result: null, error });
      return null;
    }
  }, []);

  const loadPlaybook = useCallback(async () => {
    setPlaybook(current => (current.status === "done" ? current : { status: "loading", data: null, error: null }));
    try {
      const data = await getRentalPlaybook();
      setPlaybook({ status: "done", data, error: null });
      return data;
    } catch (error) {
      setPlaybook({ status: "error", data: null, error });
      return null;
    }
  }, []);

  const resetListing = useCallback(() => setListing(idle), []);
  const resetLease = useCallback(() => setLease(idle), []);

  return { listing, lease, playbook, runListingCheck, runLeaseXray, loadPlaybook, resetListing, resetLease };
}
