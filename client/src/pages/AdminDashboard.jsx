
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  category: "Technical",
  date: "",
  venue: "",
  capacity: 50,
  imageUrl: "",
};

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      const data = await apiRequest("/events");
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(event) {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().slice(0, 16),
      venue: event.venue,
      capacity: event.capacity,
      imageUrl: event.imageUrl || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    const body = {
      ...form,
      capacity: Number(form.capacity),
      date: new Date(form.date).toISOString(),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      const result = await apiRequest(
        editingId ? `/events/${editingId}` : "/events",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(body),
        }
      );

      setMessage(result.message || (editingId ? "Event updated!" : "Event created!"));
      setForm(emptyForm);
      setEditingId(null);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteEvent(event) {
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    setError("");
    setMessage("");

    try {
      const result = await apiRequest(`/events/${event._id}`, {
        method: "DELETE",
      });
      setMessage(result.message || "Event deleted.");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container py-5 page-min-height">
      <span className="section-eyebrow">EVENT CONTROL CENTRE</span>
      <h1 className="display-6 fw-bold">Admin Dashboard</h1>
      <p className="text-secondary mb-4">
        Create and manage the events happening on your campus.
      </p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <section className="admin-form-card mb-5">
        <h2 className="h4 fw-bold mb-4">
          {editingId ? "Edit Event" : "Create a New Event"}
        </h2>

        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Event title</label>
              <input
                className="form-control"
                name="title"
                value={form.title}
                onChange={update}
                maxLength={100}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={form.category}
                onChange={update}
                required
              >
                <option>Technical</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Workshop</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={form.description}
                onChange={update}
                maxLength={2000}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Date and time</label>
              <input
                className="form-control"
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={update}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Venue</label>
              <input
                className="form-control"
                name="venue"
                value={form.venue}
                onChange={update}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Capacity</label>
              <input
                className="form-control"
                type="number"
                name="capacity"
                min={1}
                value={form.capacity}
                onChange={update}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Image URL (optional)</label>
              <input
                className="form-control"
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={update}
                placeholder="https://example.com/event.jpg"
              />
            </div>
          </div>

          <div className="d-flex gap-2 mt-4 flex-wrap">
            <button className="btn btn-fest px-4" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Save Changes" : "Create Event"}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 fw-bold">All Events</h2>
          <button className="btn btn-outline-dark btn-sm" onClick={loadEvents}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-secondary">No events have been created yet.</p>
        ) : (
          <div className="table-responsive admin-table-wrap">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>
                      <strong>{event.title}</strong>
                      <div className="small text-secondary">{event.venue}</div>
                    </td>
                    <td>{event.category}</td>
                    <td>{new Date(event.date).toLocaleDateString("en-IN")}</td>
                    <td>{event.registeredCount} / {event.capacity}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => startEdit(event)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteEvent(event)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
