
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRegistrations() {
    try {
      const data = await apiRequest("/registrations/my");
      setRegistrations(Array.isArray(data) ? data : data.registrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function cancelRegistration(eventId) {
    if (!window.confirm("Are you sure you want to cancel this registration?")) return;

    try {
      await apiRequest(`/registrations/${eventId}`, { method: "DELETE" });
      await loadRegistrations();
    } catch (err) {
      setError(err.message);
    }
  }

  const active = registrations.filter((r) => r.status === "registered");

  return (
    <main className="container py-5 page-min-height">
      <span className="section-eyebrow">YOUR CAMPUS PLANS</span>
      <h1 className="display-6 fw-bold mb-2">My Registrations</h1>
      <p className="text-secondary mb-4">
        Your upcoming experiences, all in one place.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading your registrations...</p>}

      {!loading && active.length === 0 && (
        <div className="empty-state">
          <h3>No active registrations yet</h3>
          <p>Find something fun to attend and register for your first event.</p>
          <Link to="/" className="btn btn-fest mt-2">Explore Events</Link>
        </div>
      )}

      <div className="row g-4">
        {active.map((registration) => {
          const event = registration.event;

          if (!event) return null;

          return (
            <div className="col-md-6 col-lg-4" key={registration._id}>
              <div className="registration-card h-100">
                <div className="registration-symbol"></div>
                <span className="badge text-bg-success mb-3">Registered</span>
                <h2 className="h5 fw-bold">{event.title}</h2>
                <p className="text-secondary mb-2">📍 {event.venue}</p>
                <p className="text-secondary">
                  📅 {new Date(event.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <button
                  className="btn btn-outline-danger w-100 mt-2"
                  onClick={() => cancelRegistration(event._id)}
                >
                  Cancel Registration
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
