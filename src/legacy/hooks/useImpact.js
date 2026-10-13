import { useCallback, useEffect, useState } from "react";
import { getImpact } from "../lib/featureApi.js";

/** Anonymous aggregate counters for the Dashboard impact panel. */
export function useImpact() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  const refresh = useCallback(async () => {
    try {
      const data = await getImpact();
      setState({ status: "done", data, error: null });
      return data;
    } catch (error) {
      setState({ status: "error", data: null, error });
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    getImpact()
      .then(data => { if (active) setState({ status: "done", data, error: null }); })
      .catch(error => { if (active) setState({ status: "error", data: null, error }); });
    return () => { active = false; };
  }, []);

  return { ...state, refresh };
}
