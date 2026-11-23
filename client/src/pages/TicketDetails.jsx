
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  UserRound,
  CalendarDays,
  Clock,
  MessageSquare,
  Activity,
  RefreshCw,
  Send,
} from "lucide-react";
import API from "../api/axios";
import "./TicketDetails.css";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(
  localStorage.getItem("user") ||
  sessionStorage.getItem("user") ||
  "{}"
);

const dashboardPath =
  user.role === "admin"
    ? "/admin/tickets"
    : user.role === "agent"
    ? "/agent"
    : "/employee";
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentError, setCommentError] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [requestResponse, commentsResponse, activityResponse] =
        await Promise.all([
          API.get(`/requests/${id}`, { headers }),
          API.get(`/requests/${id}/comments`, { headers }),
          API.get(`/requests/${id}/activity`, { headers }),
        ]);

      setRequest(
        requestResponse.data.request || requestResponse.data
      );

      setComments(commentsResponse.data.comments || []);
      setActivities(activityResponse.data.activities || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load ticket details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      setCommentError("Please enter a comment.");
      return;
    }

    try {
      setSending(true);
      setCommentError("");
      setCommentMessage("");

      await API.post(
        `/requests/${id}/comments`,
        {
          comment: newComment.trim(),
          is_internal: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewComment("");
      setCommentMessage("Comment added successfully!");

      await fetchDetails();
    } catch (err) {
      setCommentError(
        err.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-loading">
        Loading ticket details...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="ticket-loading">
        <p>{error || "Ticket not found."}</p>
        <button onClick={() => navigate(dashboardPath)}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-details-page">
      <header className="ticket-details-header">
        <button
  className="ticket-back-btn"
  onClick={() => navigate(dashboardPath)}
>
  <ArrowLeft size={18} />
  Back to Dashboard
</button>
        <button
          className="ticket-refresh-btn"
          onClick={fetchDetails}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <main className="ticket-details-container">
        <div className="ticket-page-heading">
          <div>
            <span className="ticket-page-tag">
              SERVICE REQUEST DETAILS
            </span>

            <h1>{request.title}</h1>

            <p>Ticket ID: {request.ticket_number}</p>
          </div>

          <span className={`agent-status ${request.status}`}>
            {request.status.replace("_", " ")}
          </span>
        </div>

        <div className="ticket-details-grid">
          <section className="ticket-info-card">
            <h2>
              <Ticket size={19} />
              Request Information
            </h2>

            <div className="ticket-info-row">
              <span>Category</span>
              <strong>{request.category}</strong>
            </div>

            <div className="ticket-info-row">
              <span>Priority</span>
              <strong className={`agent-priority ${request.priority}`}>
                {request.priority}
              </strong>
            </div>

            <div className="ticket-info-row">
              <span>Status</span>
              <strong>{request.status.replace("_", " ")}</strong>
            </div>

            <div className="ticket-info-row">
              <span>Employee ID</span>
              <strong>{request.requester_id}</strong>
            </div>

            <div className="ticket-info-row">
              <span>Assigned Agent ID</span>
              <strong>{request.assigned_to || "Unassigned"}</strong>
            </div>

            <div className="ticket-info-row">
              <span>
                <CalendarDays size={15} /> Created
              </span>
              <strong>
                {request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : "N/A"}
              </strong>
            </div>
          </section>

          <section className="ticket-description-card">
            <h2>Request Description</h2>
            <p>{request.description}</p>
          </section>
        </div>

        {/* Comments Section */}
        <section className="ticket-info-card ticket-history-card">
          <h2>
            <MessageSquare size={19} />
            Comments
          </h2>

          <form
            className="ticket-comment-form"
            onSubmit={handleAddComment}
          >
            <textarea
              className="ticket-comment-input"
              placeholder="Write your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
            />

            {commentError && (
              <p className="ticket-comment-error">
                {commentError}
              </p>
            )}

            {commentMessage && (
              <p className="ticket-comment-success">
                {commentMessage}
              </p>
            )}

            <button
              type="submit"
              className="ticket-send-comment-btn"
              disabled={sending}
            >
              <Send size={16} />
              {sending ? "Sending..." : "Send Comment"}
            </button>
          </form>

          <div className="ticket-comments-list">
            {comments.length === 0 ? (
              <p className="ticket-muted">
                No comments available. Be the first to comment.
              </p>
            ) : (
              comments.map((comment) => (
                <div className="ticket-comment" key={comment.id}>
                  <div className="ticket-comment-avatar">
                    <UserRound size={17} />
                  </div>

                  <div>
                    <strong>
                      {comment.user_name || "User"}
                    </strong>

                    <span className="ticket-comment-role">
                      {comment.user_role}
                    </span>

                    <p>{comment.comment}</p>

                    <small>
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Activity History */}
        <section className="ticket-info-card ticket-history-card">
          <h2>
            <Activity size={19} />
            Activity History
          </h2>

          {activities.length === 0 ? (
            <p className="ticket-muted">
              No activity available.
            </p>
          ) : (
            activities.map((activity) => (
              <div className="ticket-activity" key={activity.id}>
                <div className="ticket-activity-icon">
                  <Clock size={16} />
                </div>

                <div>
                  <strong>
                    {activity.action.replaceAll("_", " ")}
                  </strong>

                  <p>
                    {activity.created_at
                      ? new Date(activity.created_at).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default TicketDetails;
