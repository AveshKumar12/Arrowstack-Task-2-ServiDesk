
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Headset,
  Send,
  Ticket,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import API from "../api/axios";
import "./CreateRequest.css";

function CreateRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "IT",
    priority: "medium",
    department_id: "1",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/requests",
        {
          ...form,
          department_id: Number(form.department_id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data.message || "Service request submitted successfully!"
      );

      setForm({
        title: "",
        description: "",
        category: "IT",
        priority: "medium",
        department_id: "1",
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cr-page">
      <header className="cr-topbar">
        <div className="cr-brand">
          <div className="cr-brand-icon">
            <Headset size={22} />
          </div>
          <span>Servi<span>Desk</span></span>
        </div>

        <button
          className="cr-back-btn"
          onClick={() => navigate("/employee")}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </header>

      <main className="cr-content">
        <div className="cr-heading">
          <div className="cr-eyebrow">EMPLOYEE SUPPORT PORTAL</div>
          <h1>Create Service Request</h1>
          <p>
            Tell us what you need help with. Our support team will
            review your request and get back to you.
          </p>
        </div>

        <div className="cr-layout">
          <section className="cr-form-card">
            <div className="cr-card-heading">
              <div className="cr-heading-icon">
                <Ticket size={21} />
              </div>
              <div>
                <h2>Request Details</h2>
                <p>Provide the details of your issue below.</p>
              </div>
            </div>

            {error && (
              <div className="cr-alert error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="cr-alert success">
                <CheckCircle2 size={18} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="cr-field">
                <label htmlFor="title">Request Title *</label>
                <div className="cr-input-wrap">
                  <FileText size={18} />
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Laptop is not working"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </div>
              </div>

              <div className="cr-field">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your issue in detail..."
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="cr-form-grid">
                <div className="cr-field">
                  <label htmlFor="category">Category *</label>
                  <div className="cr-select-wrap">
                    <Tag size={17} />
                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="IT">IT Support</option>
                      <option value="HR">Human Resources</option>
                      <option value="Facilities">Facilities</option>
                    </select>
                  </div>
                </div>

                <div className="cr-field">
                  <label htmlFor="priority">Priority *</label>
                  <div className="cr-select-wrap">
                    <AlertCircle size={17} />
                    <select
                      id="priority"
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="cr-field">
                <label htmlFor="department_id">Department *</label>
                <select
                  id="department_id"
                  name="department_id"
                  className="cr-department-select"
                  value={form.department_id}
                  onChange={handleChange}
                >
                  <option value="1">Information Technology</option>
                  <option value="2">Human Resources</option>
                  <option value="3">Facilities</option>
                </select>
              </div>

              <div className="cr-form-footer">
                <p>* Required fields</p>
                <button
                  type="submit"
                  className="cr-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="cr-spinner" size={18} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="cr-info-card">
            <div className="cr-info-icon">
              <Headset size={27} />
            </div>
            <h3>We're here to help.</h3>
            <p>
              Your request will be sent to our support team.
              You can track its progress from your employee dashboard.
            </p>

            <div className="cr-info-divider" />

            <div className="cr-info-step">
              <span>01</span>
              <div>
                <strong>Submit Request</strong>
                <p>Share the details of your issue.</p>
              </div>
            </div>

            <div className="cr-info-step">
              <span>02</span>
              <div>
                <strong>Team Review</strong>
                <p>Our support team reviews your ticket.</p>
              </div>
            </div>

            <div className="cr-info-step">
              <span>03</span>
              <div>
                <strong>Issue Resolution</strong>
                <p>Track updates until your issue is resolved.</p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="cr-footer">
          © 2026 ServiDesk. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default CreateRequest;
