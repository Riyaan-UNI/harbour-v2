import { useEffect, useRef, useState } from "react";
import { getRentalPlaybook } from "../lib/featureApi.js";
import { Icon } from "./Icons.jsx";
import { Skeleton } from "./Skeleton.jsx";
import { useDialogAccessibility } from "../hooks/useDialogAccessibility.js";

/* First-hour stepper playbook. Self-loading so it can be opened from anywhere. */
export default function RentalPlaybook({ open, onClose }) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const [step, setStep] = useState(0);
  const loadedRef = useRef(false);
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
  }, [open]);
  useDialogAccessibility({ open, dialogRef: panelRef, initialFocusRef: closeRef, onClose });

  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    setState({ status: "loading", data: null, error: null });
    getRentalPlaybook()
      .then(data => setState({ status: "done", data, error: null }))
      .catch(error => setState({ status: "error", data: null, error }));
  }, [open]);

  if (!open) return null;

  const data = state.data;
  const steps = data?.steps || [];
  const current = steps[step];
  const isLast = step >= steps.length - 1;

  return (
    <div className="modal-backdrop playbook-backdrop" role="presentation" onClick={onClose}>
      <section
        className="playbook-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="playbook-title"
        tabIndex={-1}
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="modal-close" ref={closeRef} onClick={onClose} aria-label="Close the playbook">
          <Icon name="close" size={18} />
        </button>

        <span className="eyebrow">FIRST HOUR · STEP BY STEP</span>
        <h2 id="playbook-title">{data?.title || "I think I’ve been scammed"}</h2>
        {data?.intro ? <p className="playbook-intro">{data.intro}</p> : null}

        {state.status === "loading" && (
          <div className="playbook-skeleton" role="status" aria-busy="true">
            <span className="harbour-visually-hidden">Loading the playbook</span>
            <Skeleton variant="title" width="60%" />
            <Skeleton variant="line" />
            <Skeleton variant="line" width="80%" />
          </div>
        )}

        {state.status === "error" && (
          <div className="playbook-error" role="alert">
            <Icon name="alert" size={20} />
            <p>Harbour could not load the playbook. Call 18222 for advice, or 999 if you are in danger.</p>
            <a className="button secondary" href="tel:18222">Call 18222</a>
          </div>
        )}

        {current && (
          <>
            <div className="playbook-progress" aria-hidden="true">
              {steps.map((item, index) => (
                <i key={item.id} data-state={index < step ? "done" : index === step ? "active" : "pending"} />
              ))}
            </div>

            <div className="playbook-step">
              <span className="playbook-count">Step {step + 1} of {steps.length} · about {current.minutes} min</span>
              <h3>{current.title}</h3>
              <p>{current.detail}</p>
              {current.links?.filter(link => link.url).length ? (
                <div className="playbook-links">
                  {current.links.filter(link => link.url).map(link => (
                    <a key={link.url} className="button secondary" href={link.url}>{link.label} <Icon name="external" size={16} /></a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="playbook-controls">
              <button type="button" className="button secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</button>
              {isLast
                ? <button type="button" className="button" onClick={onClose}>Done <Icon name="check" size={18} /></button>
                : <button type="button" className="button" onClick={() => setStep(step + 1)}>Next step <Icon name="chevronRight" size={18} /></button>}
            </div>
          </>
        )}

        {data?.helplines?.length ? (
          <div className="playbook-helplines">
            <span className="eyebrow">KEEP THESE CLOSE</span>
            <ul>
              {data.helplines.map(line => (
                <li key={line.value}><a href={line.href}>{line.label}<strong>{line.value}</strong></a></li>
              ))}
            </ul>
          </div>
        ) : null}

        {data?.disclaimer ? <p className="figma-tool-note">{data.disclaimer}</p> : null}
      </section>
    </div>
  );
}
