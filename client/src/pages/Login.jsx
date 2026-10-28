
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="section-eyebrow">WELCOME BACK</span>
        <h1>Let the fun begin!</h1>
        <p className="text-secondary">Sign in to discover your next campus experience.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          <label className="form-label">Email address</label>
          <input
            className="form-control form-control-lg mb-3"
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label className="form-label">Password</label>
          <input
            className="form-control form-control-lg mb-4"
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button className="btn btn-fest btn-lg w-100" disabled={busy}>
            {busy ? "Signing in..." : "Login →"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          New here? <Link to="/register" className="fest-link">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
