
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fest-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          <span className="brand-icon">✦</span> CampusVibe
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <NavLink className="nav-link" to="/">Home</NavLink>

            {user && (
              <NavLink className="nav-link" to="/my-registrations">
                My Events
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink className="nav-link" to="/admin">
                Admin Panel
              </NavLink>
            )}

            {user ? (
              <>
                <span className="navbar-text small">
                  Hi, {user.name.split(" ")[0]}!
                </span>
                <button className="btn btn-light rounded-pill px-4" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="btn btn-warning rounded-pill px-4 fw-semibold" to="/register">
                  Join the Fest
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
