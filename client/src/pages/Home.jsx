
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const categories = ["All", "Technical", "Cultural", "Sports", "Workshop"];

const categoryEmoji = {
  Technical: "💻",
  Cultural: "🎭",
  Sports: "🏆",
  Workshop: "🛠️",
};

const fallbackImages = {
  Technical:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  Cultural:
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
  Workshop:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
};

function EventCard({ event }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const eventDate = new Date(event.date);
  const full = event.registeredCount >= event.capacity;

  async function registerForEvent() {
    if (!user) return;

    setBusy(true);
    setMessage("");

    try {
      const result = await apiRequest(`/registrations/${event._id}`, {
        method: "POST",
      });
      setMessage(result.message || "Registration successful!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="event-card h-100">
      <div className="event-image-wrap">
        <img
          className="event-image"
          src={event.imageUrl || fallbackImages[event.category] || fallbackImages.Technical}
          alt={event.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImages[event.category] || fallbackImages.Technical;
          }}
        />
        <span className="category-pill">
          {categoryEmoji[event.category]} {event.category}
        </span>
      </div>

      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="event-date">
          📅 {Number.isNaN(eventDate.getTime())
            ? "Date to be announced"
            : eventDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
        </div>

        <h3 className="h5 fw-bold mt-2">{event.title}</h3>
        <p className="text-secondary event-description">
          {event.description}
        </p>

        <div className="event-meta mb-3">
          <div>📍 {event.venue}</div>
          <div>
            👥 {Math.max(0, event.capacity - event.registeredCount)} seats left
          </div>
        </div>

        <div className="mt-auto">
          {!user ? (
            <Link to="/login" className="btn btn-fest w-100">
              Login to Register
            </Link>
          ) : user.role === "admin" ? (
            <Link to="/admin" className="btn btn-outline-dark w-100">
              Manage Events
            </Link>
          ) : (
            <button
              className="btn btn-fest w-100"
              onClick={registerForEvent}
              disabled={busy || full || eventDate <= new Date()}
            >
              {busy ? "Please wait..." : full ? "Fully Booked" : "Register Now →"}
            </button>
          )}

          {message && <p className="small mt-2 mb-0" role="status">{message}</p>}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesCategory = category === "All" || event.category === category;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      event.title?.toLowerCase().includes(term) ||
      event.venue?.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <header className="hero-section">
        <div className="container hero-content">
          <span className="hero-badge">✨ YOUR CAMPUS. YOUR MOMENT.</span>
          <h1>
            Make memories.
            <br />
            <span>Find your vibe.</span>
          </h1>
          <p>
            Discover competitions, cultural nights, workshops, and more.
            Your next campus adventure starts here.
          </p>
          <a href="#events" className="btn btn-warning btn-lg rounded-pill px-4 fw-bold">
            Explore Events ↓
          </a>

          <div className="hero-stats">
            <div><strong>{events.length}+</strong><span>Events</span></div>
            <div><strong>4</strong><span>Categories</span></div>
            <div><strong>∞</strong><span>Memories</span></div>
          </div>
        </div>
        <div className="hero-decoration hero-decoration-one">✦</div>
        <div className="hero-decoration hero-decoration-two">♫</div>
      </header>

      <main className="container py-5" id="events">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">WHAT'S HAPPENING?</span>
            <h2>Explore Campus Events</h2>
            <p>Something exciting is waiting for you.</p>
          </div>
          <div className="event-count">{events.length} events listed</div>
        </div>

        <div className="filter-panel">
          <div className="search-box">
            <span>🔎</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events or venues..."
              aria-label="Search events or venues"
            />
          </div>

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-button ${category === item ? "active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item === "All" ? "🌈" : categoryEmoji[item]} {item}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-5">Loading events...</div>}

        {!loading && error && (
          <div className="alert alert-danger">
            Could not load events: {error}. Check that your backend is running.
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="empty-state">
            <h3>No events found</h3>
            <p>Try another search or category, or ask your admin to add an event.</p>
          </div>
        )}

        <div className="row g-4">
          {filteredEvents.map((event) => (
            <div className="col-md-6 col-lg-4" key={event._id}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <strong>✦ CampusVibe</strong>
          <span>Made for campus memories, powered by student creativity.</span>
        </div>
      </footer>
    </>
  );
}
