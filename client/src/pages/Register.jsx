
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Headset,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  TicketCheck,
  Zap,
} from "lucide-react";

import API from "../api/axios";
import "../App.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "1",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        department_id: Number(form.department_id),
      });

      navigate("/", {
        state: { message: "Account created successfully. Please login." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <TicketCheck size={19} />,
      title: "Smart Request Tracking",
      desc: "Stay updated on every service ticket.",
    },
    {
      icon: <ShieldCheck size={19} />,
      title: "Secure Access",
      desc: "Your information stays protected.",
    },
    {
      icon: <Zap size={19} />,
      title: "Faster Support",
      desc: "Connect with the right team quickly.",
    },
  ];

  return (
    <main className="login-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* LEFT BRANDING SECTION */}
        <section className="login-left">
          <motion.div
            className="brand"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="brand-icon">
              <Headset size={25} />
            </div>

            <span>
              Servi<span className="brand-highlight">Desk</span>
            </span>
          </motion.div>

          <div className="welcome-content">
            <motion.div
              className="welcome-tag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <span className="online-dot" />
              EMPLOYEE SERVICE PORTAL
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              Get started.
              <br />
              <span>Work smarter.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Create your ServiDesk account and get access
              to a smarter workplace support experience.
            </motion.p>

            <div className="feature-list">
              {features.map((item, index) => (
                <motion.div
                  className="feature-item"
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.15 }}
                >
                  <div className="feature-icon">{item.icon}</div>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="left-footer">
            <span>© 2026 ServiDesk</span>
            <span>Employee Support System</span>
          </div>
        </section>

        {/* RIGHT REGISTER SECTION */}
        <section className="login-right">
          <motion.div
            className="login-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="mobile-brand">
              <div className="brand-icon">
                <Headset size={23} />
              </div>

              <span>
                Servi<span className="brand-highlight">Desk</span>
              </span>
            </div>

            <div className="form-heading">
              <span className="form-label">CREATE ACCOUNT</span>
              <h2>Join ServiDesk today</h2>
              <p>Enter your details to create your workspace account.</p>
            </div>

            <form onSubmit={handleRegister}>
              <label htmlFor="name">Full name</label>

              <div className="input-wrapper">
                <User size={19} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>

              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <Mail size={19} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <Lock size={19} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>

              <label htmlFor="department_id">Department</label>

              <div className="input-wrapper">
                <select
                  id="department_id"
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  required
                >
                  <option value="1">IT</option>
                  <option value="2">HR</option>
                  <option value="3">Facilities</option>
                </select>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: "#ff7777",
                    fontSize: "12px",
                    marginTop: "12px",
                  }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                type="submit"
                className="login-button"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight size={19} />}
              </motion.button>
            </form>

            <div className="secure-note">
              <ShieldCheck size={16} />
              Secure registration protected by ServiDesk
            </div>

            <div className="login-bottom">
              Already have an account?{" "}
              <Link to="/">Sign In</Link>
            </div>
          </motion.div>

          <p className="right-footer">
            Designed for better workplace support.
          </p>
        </section>
      </motion.div>
    </main>
  );
}
