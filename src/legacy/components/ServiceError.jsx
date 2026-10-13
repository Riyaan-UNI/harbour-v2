import { Icon } from "./Icons.jsx";

export default function ServiceError({ error, onRetry, children }) {
  const unreachable = error?.name === "TypeError" || error?.networkUnavailable === true;
  const unavailable = Number.isFinite(error?.status);
  const clientError = Number.isFinite(error?.status) && error.status >= 400 && error.status < 500 && Boolean(error?.message);
  const title = clientError
    ? "Check your details."
    : unreachable ? "Can’t reach Harbour right now." : unavailable ? "This service is temporarily unavailable." : "Something went wrong.";
  const explanation = clientError
    ? error.message
    : unreachable
      ? "Check your internet connection and try again. You can still use the offline help below."
      : unavailable
        ? "Harbour received your request, but could not complete it right now. Please try again in a moment."
        : "Harbour could not complete your request. Please try again, or use the offline help below.";

  return (
    <section className="service-error" role="alert">
      <div className="service-error-message">
        <span className="service-error-icon" aria-hidden="true">
          <Icon name={unreachable ? "waves" : "alert"} size={20} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{explanation}</p>
        </div>
      </div>
      <button className="service-retry" type="button" onClick={onRetry}>
        Retry <Icon name="swap" size={16} />
      </button>
      <div className="service-offline">{children}</div>
    </section>
  );
}
