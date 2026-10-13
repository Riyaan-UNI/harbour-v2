import { useEffect, useState } from "react";
import { Icon } from "./Icons.jsx";

const listeners = new Set();
let sequence = 0;

/* Fire a bottom-centre toast from anywhere. No new state library needed. */
export function toast(message, options = {}) {
  const detail = {
    id: ++sequence,
    message,
    tone: options.tone || "default",
    duration: Number.isFinite(options.duration) ? options.duration : 3600,
  };
  listeners.forEach(listener => listener(detail));
  return detail.id;
}

export function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const timers = [];
    const onToast = detail => {
      setItems(previous => [...previous, detail]);
      timers.push(window.setTimeout(() => {
        setItems(previous => previous.filter(item => item.id !== detail.id));
      }, detail.duration));
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  const dismiss = id => setItems(previous => previous.filter(item => item.id !== id));

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {items.map(item => (
        <div className={`toast is-${item.tone}`} key={item.id}>
          <Icon name={item.tone === "success" ? "check" : item.tone === "danger" || item.tone === "warning" ? "alert" : "info"} size={20} />
          <span>{item.message}</span>
          <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss message">
            <Icon name="close" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastHost;
