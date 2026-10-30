import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

async function api(url, options = {}) {
  const response = await fetch("/api" + url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "Studyline",
      ...options.headers,
    },
  });
  const body =
    response.status === 204
      ? null
      : await response
          .json()
          .catch(() => ({ message: "Server unavailable. Please try again." }));
  if (!response.ok) {
    const error = new Error(body?.message || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return body;
}
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const prettyDate = (s) =>
  new Date(s + "T12:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const blank = () => ({
  title: "",
  course: "",
  description: "",
  dueDate: today(),
  status: "To Do",
  priority: "Medium",
});
function Brand() {
  return (
    <div className="brand">
      <img src="/logo.svg" alt="" />
      <span>
        studyline<span className="brand-dot">.</span>
      </span>
    </div>
  );
}
function App() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [view, setView] = useState("All assignments"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All statuses"),
    [sort, setSort] = useState("due");
  const [editor, setEditor] = useState(null),
    [deleting, setDeleting] = useState(null),
    [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await api("/assignments");
      setItems(result.assignments);
    } catch (e) {
      if (e.status === 401) {
        setUser(null);
        setItems([]);
      } else setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    api("/auth/me")
      .then((r) => setUser(r.user))
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (user) load();
  }, [user]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      setUser(null);
      setItems([]);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  async function changeStatus(item, next) {
    setBusyId(item._id);
    setError("");
    try {
      const result = await api(`/assignments/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      setItems((old) =>
        old.map((a) => (a._id === item._id ? result.assignment : a)),
      );
      setNotice("Assignment updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }
  const active = items.filter((a) => a.status !== "Completed");
  const overdue = active.filter((a) => a.dueDate < today());
  const done = items.filter((a) => a.status === "Completed");
  let filtered = items.filter(
    (a) =>
      (view !== "Completed" || a.status === "Completed") &&
      (view !== "Upcoming" ||
        (a.status !== "Completed" && a.dueDate >= today())) &&
      (view !== "Overdue" ||
        (a.status !== "Completed" && a.dueDate < today())) &&
      (status === "All statuses" || a.status === status) &&
      `${a.title} ${a.course} ${a.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  filtered = [...filtered].sort((a, b) =>
    sort === "course"
      ? a.course.localeCompare(b.course)
      : sort === "priority"
        ? ["High", "Medium", "Low"].indexOf(a.priority) -
          ["High", "Medium", "Low"].indexOf(b.priority)
        : a.dueDate.localeCompare(b.dueDate),
  );
  if (!ready)
    return (
      <div className="startup">
        <Brand />
        <p>Opening your workspace…</p>
      </div>
    );
  if (!user) return <Auth onAuth={setUser} initialError={error} />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        <nav aria-label="Assignment views">
          {[
            ["All assignments", "▦"],
            ["Upcoming", "◷"],
            ["Overdue", "!"],
            ["Completed", "✓"],
          ].map(([label, icon]) => (
            <button
              className={view === label ? "nav-item selected" : "nav-item"}
              key={label}
              onClick={() => setView(label)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
              <small>
                {label === "All assignments"
                  ? items.length
                  : label === "Completed"
                    ? done.length
                    : label === "Overdue"
                      ? overdue.length
                      : active.length - overdue.length}
              </small>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="little-star">✦</span>
          <h3>
            A little progress,
            <br />
            every day.
          </h3>
          <p>Make space for what matters. One assignment at a time.</p>
        </div>
        <div className="profile">
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <span>Student workspace</span>
          </div>
          <button
            className="icon-button"
            title="Sign out"
            aria-label="Sign out"
            onClick={logout}
          >
            ↗
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            Workspace <span className="breadcrumb">/ {view}</span>
          </span>
          <span className="today-label">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </header>
        <div className="main-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">A CLEARER HEAD STARTS HERE</div>
              <h1>Your work, in focus.</h1>
              <p>
                Hi {user.name.split(" ")[0]}. Let’s make room for a productive
                day.
              </p>
            </div>
            <button className="primary" onClick={() => setEditor({})}>
              <span aria-hidden="true">＋</span> New assignment
            </button>
          </section>
          <section className="stats" aria-label="Assignment overview">
            {[
              [
                "Total assignments",
                items.length,
                "Across your courses",
                "neutral",
              ],
              [
                "In progress",
                items.filter((a) => a.status === "In Progress").length,
                "Keep the momentum going",
                "amber",
              ],
              ["Completed", done.length, "One step closer", "green"],
              ["Overdue", overdue.length, "Time for a fresh plan", "red"],
            ].map(([label, n, sub, color]) => (
              <div className={"stat " + color} key={label}>
                <div>
                  <span className="stat-dot" />
                  {label}
                </div>
                <strong>{n.toString().padStart(2, "0")}</strong>
                <p>{sub}</p>
              </div>
            ))}
          </section>
          <section className="assignment-section">
            <div className="section-heading">
              <h2>
                {view}
                <span>{filtered.length}</span>
              </h2>
              <span className="section-caption">
                Small steps. Meaningful progress.
              </span>
            </div>
            <div className="toolbar">
              <label className="search">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="Search assignments"
                  placeholder="Search assignments or courses…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <div className="filters">
                <label>
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {["All statuses", "To Do", "In Progress", "Completed"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Sort assignments</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="due">Due date ↑</option>
                    <option value="priority">Priority</option>
                    <option value="course">Course A–Z</option>
                  </select>
                </label>
              </div>
            </div>
            {error && (
              <div className="error" role="alert">
                {error} <button onClick={load}>Try again</button>
              </div>
            )}
            {loading ? (
              <div className="empty" role="status">
                Loading your assignments…
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <h3>
                  {items.length
                    ? "A little breathing room."
                    : "Your next chapter starts here."}
                </h3>
                <p>
                  {items.length
                    ? "No assignments match this view. Try another filter."
                    : "Add your first assignment and turn a busy semester into a clear plan."}
                </p>
                <button
                  className="secondary"
                  onClick={() =>
                    items.length
                      ? (setView("All assignments"),
                        setSearch(""),
                        setStatus("All statuses"))
                      : setEditor({})
                  }
                >
                  {items.length
                    ? "Show all assignments"
                    : "Add your first assignment"}
                </button>
              </div>
            ) : (
              <div className="assignment-list">
                {filtered.map((a) => (
                  <article
                    className={
                      "assignment-card " +
                      (a.status === "Completed" ? "is-complete" : "")
                    }
                    key={a._id}
                  >
                    <button
                      className={
                        "check " + (a.status === "Completed" ? "checked" : "")
                      }
                      aria-label={
                        a.status === "Completed"
                          ? `Reopen ${a.title}`
                          : `Complete ${a.title}`
                      }
                      disabled={busyId === a._id}
                      onClick={() =>
                        changeStatus(
                          a,
                          a.status === "Completed" ? "To Do" : "Completed",
                        )
                      }
                    >
                      {a.status === "Completed" ? "✓" : ""}
                    </button>
                    <div className="assignment-body">
                      <div className="card-top">
                        <span className="course">{a.course}</span>
                        <span
                          className={"priority " + a.priority.toLowerCase()}
                        >
                          <span>●</span> {a.priority}
                        </span>
                      </div>
                      <h3>{a.title}</h3>
                      {a.description && <p>{a.description}</p>}
                      <div className="card-bottom">
                        <span
                          className={
                            "due " +
                            (a.dueDate < today() && a.status !== "Completed"
                              ? "late"
                              : "")
                          }
                        >
                          ◷ {prettyDate(a.dueDate)}
                          {a.dueDate < today() && a.status !== "Completed"
                            ? " · Overdue"
                            : ""}
                        </span>
                        <label>
                          <span className="sr-only">Status for {a.title}</span>
                          <select
                            className={
                              "status " +
                              a.status.toLowerCase().replaceAll(" ", "-")
                            }
                            value={a.status}
                            disabled={busyId === a._id}
                            onChange={(e) => changeStatus(a, e.target.value)}
                          >
                            {["To Do", "In Progress", "Completed"].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${a.title}`}
                        onClick={() => setEditor(a)}
                      >
                        ✎
                      </button>
                      <button
                        className="icon-button delete"
                        aria-label={`Delete ${a.title}`}
                        onClick={() => setDeleting(a)}
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <footer>
            Made for a calmer semester.<span>STUDYLINE · GROUP 2</span>
          </footer>
        </div>
      </main>
      {notice && (
        <div className="toast" role="status">
          ✓ {notice}
        </div>
      )}
      {editor && (
        <Editor
          item={editor}
          onClose={() => setEditor(null)}
          onSaved={(a) => {
            setItems((old) =>
              editor._id
                ? old.map((x) => (x._id === a._id ? a : x))
                : [...old, a],
            );
            setEditor(null);
            setNotice(editor._id ? "Changes saved." : "Assignment added.");
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          item={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setItems((old) => old.filter((a) => a._id !== deleting._id));
            setDeleting(null);
            setNotice("Assignment deleted.");
          }}
        />
      )}
    </div>
  );
}
function Auth({ onAuth, initialError }) {
  const [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(initialError || "");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await api("/auth/" + (register ? "register" : "login"), {
        method: "POST",
        body: JSON.stringify(values),
      });
      onAuth(result.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <section className="auth-story">
        <Brand />
        <div className="auth-pitch">
          <div className="eyebrow">LESS OVERWHELM. MORE MOMENTUM.</div>
          <h1>
            A clear plan.
            <br />A calmer semester.
          </h1>
          <p>
            All your assignments, one thoughtful workspace.
            <br />
            Know what’s next and keep moving forward.
          </p>
          <div className="illustration" aria-hidden="true">
            <div className="paper">
              <span className="paper-label">YOUR WEEK, SIMPLIFIED</span>
              <div>
                ✓ <span>Start with a plan</span>
              </div>
              <div>
                ✓ <span>Make a little progress</span>
              </div>
              <div>
                ○ <span>Celebrate the finish</span>
              </div>
            </div>
            <span className="floating-star">✦</span>
            <span className="floating-note">You’ve got this.</span>
          </div>
        </div>
        <small>STUDYLINE · BUILT BY GROUP 2</small>
      </section>
      <main className="auth-main">
        <div className="auth-form">
          <span className="eyebrow">YOUR STUDENT WORKSPACE</span>
          <h2>{register ? "Make room for progress." : "Welcome back."}</h2>
          <p>
            {register
              ? "Create your account to start planning."
              : "Sign in and pick up where you left off."}
          </p>
          <form onSubmit={submit}>
            {register && (
              <label>
                Full name
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                name="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="you@college.ca"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                required
                minLength={register ? 12 : 1}
                maxLength={72}
                autoComplete={register ? "new-password" : "current-password"}
                placeholder={
                  register ? "At least 12 characters" : "Enter your password"
                }
              />
            </label>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <button className="primary auth-submit" disabled={busy}>
              {busy
                ? "One moment…"
                : register
                  ? "Create account →"
                  : "Sign in →"}
            </button>
          </form>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to Studyline?"}{" "}
            <button
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Sign in" : "Create an account"}
            </button>
          </p>
          <div className="auth-footnote">
            A little organization goes a long way.
          </div>
        </div>
      </main>
    </div>
  );
}
function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector("input,button")?.focus();
    return () => {
      document.body.style.overflow = bodyOverflow;
      old?.focus();
    };
  }, []);
  function keys(e) {
    if (e.key === "Escape") onClose();
    if (e.key === "Tab") {
      const focusable = [
        ...ref.current.querySelectorAll(
          "button:not(:disabled),input,select,textarea",
        ),
      ];
      const first = focusable[0],
        last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onKeyDown={keys}
      >
        <div className="modal-header">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function Editor({ item, onClose, onSaved }) {
  const [values, setValues] = useState({ ...blank(), ...item }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const field = (key) => ({
    value: values[key],
    onChange: (e) => setValues({ ...values, [key]: e.target.value }),
  });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { title, course, description, dueDate, status, priority } = values;
    try {
      const result = await api(
        "/assignments" + (item._id ? "/" + item._id : ""),
        {
          method: item._id ? "PATCH" : "POST",
          body: JSON.stringify({
            title,
            course,
            description,
            dueDate,
            status,
            priority,
          }),
        },
      );
      onSaved(result.assignment);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <Modal
      title={item._id ? "Edit assignment" : "A new step forward"}
      onClose={() => !busy && onClose()}
    >
      <p className="modal-subtitle">
        Give your assignment a place in the plan.
      </p>
      <form onSubmit={submit}>
        <label>
          Assignment title
          <input
            required
            maxLength={120}
            placeholder="e.g. Project Part 1"
            {...field("title")}
          />
        </label>
        <div className="form-row">
          <label>
            Course
            <input
              required
              maxLength={60}
              placeholder="e.g. COMP229"
              {...field("course")}
            />
          </label>
          <label>
            Due date
            <input type="date" required {...field("dueDate")} />
          </label>
        </div>
        <label>
          Description <span className="optional">optional</span>
          <textarea
            rows={3}
            maxLength={2000}
            placeholder="What needs to get done?"
            {...field("description")}
          />
        </label>
        <div className="form-row">
          <label>
            Status
            <select {...field("status")}>
              {["To Do", "In Progress", "Completed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select {...field("priority")}>
              {["Low", "Medium", "High"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : item._id ? "Save changes" : "Add assignment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function DeleteDialog({ item, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function remove() {
    setBusy(true);
    try {
      await api("/assignments/" + item._id, { method: "DELETE" });
      onDeleted();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <Modal title="Delete assignment?" onClose={() => !busy && onClose()}>
      <p className="modal-subtitle">
        “{item.title}” will be permanently removed. This cannot be undone.
      </p>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="modal-footer">
        <button className="secondary" onClick={onClose} disabled={busy}>
          Keep assignment
        </button>
        <button className="danger" onClick={remove} disabled={busy}>
          {busy ? "Deleting…" : "Delete assignment"}
        </button>
      </div>
    </Modal>
  );
}
createRoot(document.getElementById("root")).render(<App />);
