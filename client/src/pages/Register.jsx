
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    department: "",
  });

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
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="section-eyebrow">JOIN THE COMMUNITY</span>
        <h1>Your campus awaits!</h1>
        <p className="text-secondary">Create your student account to register for events.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submit}>
          <label className="form-label">Full name</label>
          <input
            className="form-control mb-3"
            name="name"
            value={form.name}
            onChange={update}
            minLength={2}
            maxLength={60}
            autoComplete="name"
            required
          />

          <label className="form-label">College email</label>
          <input
            className="form-control mb-3"
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            autoComplete="email"
            required
          />

          <label className="form-label">Password (at least 8 characters)</label>
          <input
            className="form-control mb-3"
            type="password"
            name="password"
            value={form.password}
            onChange={update}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <label className="form-label">Roll number (optional)</label>
          <input
            className="form-control mb-3"
            name="rollNumber"
            value={form.rollNumber}
            onChange={update}
            maxLength={30}
          />

          <label className="form-label">Department (optional)</label>
          <select
            className="form-select mb-4"
            name="department"
            value={form.department}
            onChange={update}
          >
            <option value="">Select department</option>
            <option value="CSE">CSE</option>
            <option value="CSM">CSE (AI & ML)</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Other">Other</option>
          </select>

          <button className="btn btn-fest btn-lg w-100" disabled={busy}>
            {busy ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already registered? <Link to="/login" className="fest-link">Login</Link>
        </p>
      </div>
    </main>
  );
}
