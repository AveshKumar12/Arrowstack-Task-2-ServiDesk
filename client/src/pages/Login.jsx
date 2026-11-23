import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Headset,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  TicketCheck,
  Zap,
} from "lucide-react";

import API from "../api/axios";
import "../index.css";
import"../App.css"

function login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Backend Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid login response from server.");
      }

      // Save authentication data
      if (remember) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      // Role-based navigation
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "agent") {
        navigate("/agent");
      } else if (user.role === "employee") {
        navigate("/employee");
      } else {
        throw new Error("Your account role is not recognized.");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* LEFT SECTION */}
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
              Your workplace.
              <br />
              <span>Made simpler.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              One platform to manage service requests, track issues,
              and get the support you need — all in one place.
            </motion.p>

            <div className="feature-list">
              {[
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
              ].map((item, index) => (
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

        {/* RIGHT LOGIN SECTION */}
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
              <span className="form-label">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Enter your details to access your workspace.</p>
            </div>

            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="password-label">
                <label htmlFor="password">Password</label>
                <a href="#forgot-password">Forgot password?</a>
              </div>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              <label className="remember-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: "#ff7777",
                    fontSize: "12px",
                    marginBottom: "15px",
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
                {loading ? "Signing in..." : "Sign In"}

                {!loading && <ArrowRight size={19} />}
              </motion.button>
            </form>
<div className="secure-note">
  <ShieldCheck size={16} />
  Secure login protected by ServiDesk
</div>

<div className="login-bottom">
  Don't have an account?{" "}
  <Link to="/register">
    Create Account <ArrowRight size={16} />
  </Link>
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

export default login;