/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ===================== AUTH (REWRITTEN) ===================== */
document.addEventListener("DOMContentLoaded", () => {
  // Add loading guard to avoid flicker while Firebase resolves auth state
  document.body.classList.add("auth-loading");

  // Defensive selectors (prefer elements inside the auth section)
  const authSection = document.querySelector("section#auth") || document.getElementById("auth");
  const dashboardSection = document.getElementById("dashboard");

  const $inAuth = (sel) => authSection?.querySelector(sel) || document.querySelector(sel);

  const emailInput = $inAuth("#authEmail") || document.getElementById("authEmail");
  const passwordInput = $inAuth("#authPassword") || document.getElementById("authPassword");
  const registerBtn = $inAuth("#signupBtn") || document.getElementById("signupBtn");
  const loginBtn = $inAuth("#loginBtn") || document.getElementById("loginBtn");
  const consentCheckbox = $inAuth("#consentCheckbox") || document.getElementById("consentCheckbox");

  // Protected menus (may be null)
  const scannerMenu = document.getElementById("scannerMenu");
  const quizMenu = document.getElementById("quizMenu");
  const cryptoMenu = document.getElementById("cryptoMenu");
  const logoutMenu = document.getElementById("logoutMenu");

  // If critical auth elements are missing, log and continue (do not block entire app)
  if (!emailInput || !passwordInput || !registerBtn || !loginBtn) {
    console.error("Critical auth elements missing:", { emailInput, passwordInput, registerBtn, loginBtn });
    // Still continue so onAuthStateChanged can manage UI; avoid early return
  }

  /* ================= Inline message helper ================= */
  function showMessage(text = "", type = "info") {
    if (!authSection) return;
    let box = authSection.querySelector("#authMessage");
    if (!box) {
      box = document.createElement("div");
      box.id = "authMessage";
      box.style.margin = "0.75rem 0";
      box.style.fontSize = "0.95rem";
      authSection.prepend(box);
    }
    box.textContent = text;
    box.style.color = type === "error" ? "#ff6b6b" : "#00d084";
    box.style.display = text ? "block" : "none";
  }

  /* ================= BUTTON TOGGLE (login allowed without consent) ================= */
  function toggleAuthButtons() {
    const emailEl = document.getElementById("authEmail");
    const passEl = document.getElementById("authPassword");
    const signupEl = document.getElementById("signupBtn");
    const loginEl = document.getElementById("loginBtn");
    const consentEl = document.getElementById("consentCheckbox");

    const emailFilled = !!(emailEl && emailEl.value && emailEl.value.trim() !== "");
    const passFilled = !!(passEl && passEl.value && passEl.value.trim() !== "");
    const consentChecked = !!(consentEl && consentEl.checked);

    // Login: enable when email + password are filled (do not require consent)
    if (loginEl) loginEl.disabled = !(emailFilled && passFilled);

    // Register: require consent if checkbox exists, otherwise require only email+password
    if (signupEl) {
      const requireConsent = !!consentEl;
      signupEl.disabled = !(emailFilled && passFilled && (!requireConsent || consentChecked));
    }

    console.debug("toggleAuthButtons", { emailFilled, passFilled, consentChecked, loginDisabled: loginEl?.disabled, signupDisabled: signupEl?.disabled });
  }

  // Wire input listeners defensively
  if (emailInput) emailInput.addEventListener("input", toggleAuthButtons);
  if (passwordInput) passwordInput.addEventListener("input", toggleAuthButtons);
  if (consentCheckbox) consentCheckbox.addEventListener("change", toggleAuthButtons);

  // Ensure initial state after wiring
  setTimeout(toggleAuthButtons, 50);

  /* ================= ERROR MAPPING ================= */
  function formatError(code) {
    const map = {
      "auth/email-already-in-use": "Email already registered.",
      "auth/invalid-email": "Invalid email format.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/user-not-found": "Account not found.",
      "auth/wrong-password": "Incorrect password.",
      "auth/network-request-failed": "Network error."
    };
    return map[code] || "Authentication error.";
  }

  /* ================= UTILS ================= */
  function resetAuthForm() {
    if (emailInput) emailInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (consentCheckbox) consentCheckbox.checked = false;
    toggleAuthButtons();
  }

  function setButtonsDisabled(state) {
    if (registerBtn) registerBtn.disabled = !!state;
    if (loginBtn) loginBtn.disabled = !!state;
  }

  /* ================= ACTIVATE AUTHENTICATED UI ================= */
  function activateAuthenticatedUI(user) {
    scannerMenu?.classList.remove("hidden");
    quizMenu?.classList.remove("hidden");
    cryptoMenu?.classList.remove("hidden");
    logoutMenu?.classList.remove("hidden");

    // Hide all sections and show scanner if available, otherwise dashboard
    document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
    const scanner = document.getElementById("scanner");
    if (scanner) {
      scanner.classList.remove("hidden");
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      document.querySelector('.menu a[data-target="scanner"]')?.classList.add("active");
    } else if (dashboardSection) {
      dashboardSection.classList.remove("hidden");
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      document.querySelector('.menu a[data-target="dashboard"]')?.classList.add("active");
    }

    resetAuthForm();
    showMessage("", "info");

    setTimeout(() => document.getElementById("targetUrl")?.focus(), 50);
  }

  /* ================= REGISTER HANDLER ================= */
  if (registerBtn) {
    registerBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      showMessage("", "info");

      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (!email || !password) {
        showMessage("Enter email and password.", "error");
        return;
      }

      // If consent checkbox exists, require it for registration
      if (consentCheckbox && !consentCheckbox.checked) {
        showMessage("You must agree to the terms to register.", "error");
        return;
      }

      setButtonsDisabled(true);
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage("Account created. Please verify your email before signing in.");
        resetAuthForm();
      } catch (err) {
        console.error("Register error:", err);
        showMessage(formatError(err.code), "error");
      } finally {
        toggleAuthButtons();
      }
    });
  }

  /* ================= LOGIN HANDLER ================= */
  if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      showMessage("", "info");

      const email = emailInput?.value.trim();
      const password = passwordInput?.value.trim();
      if (!email || !password) {
        showMessage("Enter email and password.", "error");
        return;
      }

      setButtonsDisabled(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Enforce email verification if required
        if (userCredential?.user && !userCredential.user.emailVerified) {
          await signOut(auth);
          showMessage("Please verify your email before logging in.", "error");
          return;
        }

        activateAuthenticatedUI(userCredential.user);
        showMessage("Login successful.");
        resetAuthForm();
      } catch (err) {
        console.error("Login error:", err);
        showMessage(formatError(err.code), "error");
      } finally {
        toggleAuthButtons();
      }
    });
  }

  /* ================= LOGOUT ================= */
  window.logout = async () => {
    try {
      await signOut(auth);
      showMessage("Logged out.");
      // Return to public landing (dashboard) by default
      document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
      if (dashboardSection) {
        dashboardSection.classList.remove("hidden");
        document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
        document.querySelector('.menu a[data-target="dashboard"]')?.classList.add("active");
      } else {
        document.getElementById("auth")?.classList.remove("hidden");
        document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
        document.querySelector('.menu a[data-target="auth"]')?.classList.add("active");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      showMessage("Logout failed.", "error");
    }
  };

  /* ================= AUTH STATE HANDLER ================= */
  onAuthStateChanged(auth, (user) => {
    // Remove loading guard once auth state resolves
    document.body.classList.remove("auth-loading");
    document.body.classList.add("auth-loaded");

    // Helper to show a section and set menu active
    function showSection(id) {
      document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
      const el = document.getElementById(id);
      if (el) el.classList.remove("hidden");
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      document.querySelector(`.menu a[data-target="${id}"]`)?.classList.add("active");
    }

    if (user && user.emailVerified !== false) {
      activateAuthenticatedUI(user);
      console.log("User logged in:", user.email);
    } else {
      // Hide protected menus
      scannerMenu?.classList.add("hidden");
      quizMenu?.classList.add("hidden");
      cryptoMenu?.classList.add("hidden");
      logoutMenu?.classList.add("hidden");

      // If user explicitly navigated to auth (menu link active), show auth; otherwise show dashboard
      const activeMenu = document.querySelector(".menu a.active");
      const explicitTarget = activeMenu?.dataset?.target;

      if (explicitTarget === "auth") {
        showSection("auth");
      } else if (dashboardSection) {
        showSection("dashboard");
      } else {
        // fallback: keep auth hidden unless explicitly requested
        document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
        document.getElementById("auth")?.classList.add("hidden");
      }

      console.log("No authenticated user - showing public landing (or auth if explicitly requested)");
      resetAuthForm();
    }
  }, (error) => {
    console.error("onAuthStateChanged error:", error);
    document.body.classList.remove("auth-loading");
    document.body.classList.add("auth-loaded");

    // Fallback to dashboard on error
    if (dashboardSection) {
      document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
      dashboardSection.classList.remove("hidden");
      document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
      document.querySelector('.menu a[data-target="dashboard"]')?.classList.add("active");
    }
    resetAuthForm();
  });

  // End DOMContentLoaded
});

/* ===================== SCANNER SETUP ===================== */

// Get elements safely
const startScanBtn = document.getElementById("startScanBtn");
const progressBar = document.getElementById("progressBar");
const targetUrlInput = document.getElementById("targetUrl");
const scanModeSelect = document.getElementById("scanMode");
const scanConsentCheckbox = document.getElementById("scanConsentCheckbox");
const scanResultContainer = document.getElementById("scanResult");

// Only attach listener if button exists
if (startScanBtn) {
  startScanBtn.addEventListener("click", startScan);
}

/* ===================== SCAN FUNCTION ===================== */
async function startScan() {

  try {

    // ✅ Ensure user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to perform a scan.");
      return;
    }

    const token = await user.getIdToken(true);

    // ✅ Get input values safely
    const targetUrl = targetUrlInput?.value.trim();
    const mode = scanModeSelect?.value;
    const consent = scanConsentCheckbox?.checked;

    if (!targetUrl || !consent) {
      if (scanResultContainer) {
        scanResultContainer.innerHTML =
          "<p style='color:red;'>Enter URL and confirm consent.</p>";
      }
      return;
    }

    // Disable button during scan
    startScanBtn.disabled = true;

    if (progressBar) {
      progressBar.style.width = "0%";
      progressBar.innerText = "0%";
    }

    if (scanResultContainer) {
      scanResultContainer.innerHTML = "";
    }

    const response = await fetch(
      "https://webvuln-scanner-backend.onrender.com/api/scan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          target_url: targetUrl,
          mode,
          consent: true
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();

    if (progressBar) {
      progressBar.style.width = "100%";
      progressBar.innerText = "100%";
    }

    renderScanResults(data.results);

  } catch (err) {
    console.error("Scan error:", err);

    if (scanResultContainer) {
      scanResultContainer.innerHTML =
        `<p style="color:red;">Scan failed: ${err.message}</p>`;
    }

  } finally {
    if (startScanBtn) {
      startScanBtn.disabled = false;
    }
  }
}


/* ===================== RENDER RESULTS (FULL REPORT + PDF EXPORT) ===================== */
function renderScanResults(results) {
  const container = document.getElementById("scanResult");
  if (!container) return;

  // Clear container
  container.innerHTML = "";

  if (!results) {
    container.innerHTML = "<p>No scan results available.</p>";
    return;
  }

  // Helper: escape HTML
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Risk mapping
  const riskMap = {
    high: { cls: "risk-high", icon: "❌", label: "High Risk" },
    medium: { cls: "risk-medium", icon: "⚠️", label: "Medium Risk" },
    low: { cls: "risk-low", icon: "✅", label: "No Risk" }
  };

  const mainRisk = riskMap[(results.risk_rating || "").toLowerCase()] || riskMap.low;

  // Explanations for each key (human-friendly)
  const explanations = {
    pages_crawled: "Pages discovered during crawling. Review for unexpected or sensitive endpoints.",
    missing_headers: "Security headers that are missing or misconfigured (e.g., CSP, HSTS, X-Frame-Options).",
    open_paths: "Open directories or endpoints that may expose files or functionality.",
    forms_found: "HTML forms detected; check for input validation and CSRF protections.",
    reflected_inputs: "Inputs reflected in responses; potential reflected XSS vectors.",
    sql_errors: "Database error messages or SQL-related responses that may indicate injection points.",
    robots_sitemap: "Robots.txt or sitemap entries found; may reveal hidden paths.",
    insecure_http_methods: "HTTP methods allowed by the server (e.g., PUT, DELETE) that may be unsafe."
  };

  // Helper: determine badge for a key/value
  function getRiskBadge(value, key) {
    const highKeys = ["sql_errors", "reflected_inputs", "insecure_http_methods"];
    const mediumKeys = ["missing_headers", "forms_found", "pages_crawled"];
    if (value === null || value === undefined) return riskMap.low;
    if (Array.isArray(value) && value.length === 0) return riskMap.low;
    if (typeof value === "string" && value.trim() === "") return riskMap.low;
    if (highKeys.includes(key)) return riskMap.high;
    if (mediumKeys.includes(key)) return riskMap.medium;
    return riskMap.low;
  }

  // Build header HTML
  const headerHtml = `
    <div class="report-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <div>
        <h3 style="margin:0 0 6px 0;">Scan Report</h3>
        <div style="color:#cfd8dc;font-size:0.95rem;">Target: <strong>${escapeHtml(results.target || "N/A")}</strong></div>
        <div style="color:#cfd8dc;font-size:0.9rem;">Mode: <strong>${escapeHtml(results.scan_mode || "N/A")}</strong> • Started: <strong>${escapeHtml(results.started_at || "N/A")}</strong></div>
      </div>
      <div style="text-align:right;">
        <div class="risk-badge ${mainRisk.cls}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:#1a1a1a;color:#fff;">
          <span style="font-size:1.1rem;">${mainRisk.icon}</span>
          <span style="font-weight:700;">${mainRisk.label}</span>
        </div>
      </div>
    </div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:12px 0;">
  `;

  // Keys to display and friendly labels
  const keyLabels = {
    pages_crawled: "Pages Crawled",
    missing_headers: "Missing Security Headers",
    open_paths: "Open Paths",
    forms_found: "Forms Detected",
    reflected_inputs: "Reflected Inputs (XSS)",
    sql_errors: "SQL Injection Errors",
    robots_sitemap: "Robots.txt / Sitemap",
    insecure_http_methods: "Insecure HTTP Methods"
  };

  // Build sections
  let bodyHtml = `<div class="report-body">`;

  // Severity counts
  const severityCounts = {
    high: (results.sql_errors?.length || 0) + (results.reflected_inputs?.length || 0) + (results.insecure_http_methods?.length || 0),
    medium: (results.missing_headers?.length || 0) + (results.forms_found?.length || 0) + (results.pages_crawled?.length || 0),
    low: 0
  };

  bodyHtml += `<div style="margin-bottom:12px;color:#cfd8dc;"><strong>Summary:</strong> ${severityCounts.high} High, ${severityCounts.medium} Medium findings</div>`;

  // Iterate keys
  Object.keys(keyLabels).forEach((key) => {
    const label = keyLabels[key];
    const value = results[key];
    const badge = getRiskBadge(value, key);

    // Explanation text
    const explain = explanations[key] || "No explanation available.";

    // Render arrays as collapsible lists
    if (Array.isArray(value)) {
      const count = value.length;
      bodyHtml += `
        <div class="report-section" style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><strong>${escapeHtml(label)}</strong> &nbsp; <small style="color:#bfc9cc">(${count} item${count !== 1 ? "s" : ""})</small></div>
            <div style="color:#cfd8dc">${badge.icon} ${badge.label}</div>
          </div>
          <div style="margin-top:6px;color:#bfc9cc;font-size:0.95rem;">${escapeHtml(explain)}</div>
          <details style="margin-top:8px;background:#0f1116;padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.03);">
            <summary style="cursor:pointer;color:#e6edf3;">View items</summary>
            <ul style="margin:8px 0 0 18px;color:#dfe7ea;">`;
      value.forEach(item => {
        let display = (typeof item === "string") ? escapeHtml(item) : escapeHtml(JSON.stringify(item, null, 2));
        bodyHtml += `<li style="margin-bottom:6px;font-family:monospace;">${display}</li>`;
      });
      bodyHtml += `</ul></details></div>`;
    } else if (typeof value === "object" && value !== null) {
      // Object: pretty-print
      bodyHtml += `
        <div class="report-section" style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><strong>${escapeHtml(label)}</strong></div>
            <div style="color:#cfd8dc">${badge.icon} ${badge.label}</div>
          </div>
          <div style="margin-top:6px;color:#bfc9cc;font-size:0.95rem;">${escapeHtml(explain)}</div>
          <pre style="background:#0f1116;color:#dfe7ea;padding:10px;border-radius:6px;margin-top:8px;overflow:auto;">${escapeHtml(JSON.stringify(value, null, 2))}</pre>
        </div>`;
    } else {
      // Primitive or missing
      const display = (value === null || value === undefined || value === "") ? "None" : escapeHtml(String(value));
      bodyHtml += `
        <div class="report-section" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${escapeHtml(label)}</strong>
            <div style="color:#bfc9cc;font-size:0.95rem;margin-top:6px;">${escapeHtml(explain)}</div>
          </div>
          <div style="text-align:right;color:#cfd8dc;">
            <div style="font-weight:700;">${display}</div>
            <div style="margin-top:6px;color:#cfd8dc;">${badge.icon} ${badge.label}</div>
          </div>
        </div>`;
    }
  });

  // User and consent info
  bodyHtml += `
    <div style="margin-top:14px;border-top:1px dashed rgba(255,255,255,0.04);padding-top:12px;color:#cfd8dc;">
      <div><strong>User ID:</strong> ${escapeHtml(results.user_id || "N/A")}</div>
      <div style="margin-top:6px;"><strong>Consent Confirmed:</strong> ${escapeHtml(String(results.consent_confirmed ?? "N/A"))}</div>
      <div style="margin-top:6px;"><strong>Scan ID:</strong> ${escapeHtml(results.scan_id || "N/A")}</div>
    </div>`;

  bodyHtml += `</div>`; // close report-body

  // Compose final HTML
  container.innerHTML = headerHtml + bodyHtml;

  // Buttons container
  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "10px";
  btnRow.style.marginTop = "14px";

  // JSON download button
  const downloadJsonBtn = document.createElement("button");
  downloadJsonBtn.className = "download-btn";
  downloadJsonBtn.textContent = "⬇️ Download JSON Report";
  downloadJsonBtn.type = "button";
  downloadJsonBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan_report_${results.scan_id || "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // PDF export button (opens printable window)
  const exportPdfBtn = document.createElement("button");
  exportPdfBtn.className = "export-pdf-btn";
  exportPdfBtn.textContent = "📄 Export Printable Report (Save as PDF)";
  exportPdfBtn.type = "button";
  exportPdfBtn.addEventListener("click", () => {
    // Build printable HTML (simple, self-contained)
    const printableStyles = `
      <style>
        body { background:#0f111a; color:#e6edf3; font-family: Arial, Helvetica, sans-serif; padding:20px; }
        .report-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        h1 { color:#ff4d4d; font-size:20px; margin:0 0 8px 0; }
        .risk-badge { display:inline-block; padding:6px 10px; border-radius:6px; background:#1a1a1a; color:#fff; }
        .section { margin-top:12px; padding:10px; background:#0f1116; border-radius:6px; border:1px solid rgba(255,255,255,0.03); }
        pre { white-space:pre-wrap; word-wrap:break-word; background:#0b0b0d; padding:10px; border-radius:6px; color:#dfe7ea; }
        ul { margin:8px 0 0 18px; color:#dfe7ea; }
        .meta { color:#cfd8dc; font-size:0.95rem; margin-top:6px; }
      </style>
    `;

    // Reuse the rendered container HTML but strip interactive elements (details/summary)
    const printableContent = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Scan Report - ${escapeHtml(results.scan_id || results.target || "report")}</title>
          ${printableStyles}
        </head>
        <body>
          <div class="report-header">
            <div>
              <h1>Scan Report</h1>
              <div class="meta"><strong>Target:</strong> ${escapeHtml(results.target || "N/A")}</div>
              <div class="meta"><strong>Mode:</strong> ${escapeHtml(results.scan_mode || "N/A")} • <strong>Started:</strong> ${escapeHtml(results.started_at || "N/A")}</div>
            </div>
            <div>
              <div class="risk-badge">${mainRisk.icon} ${mainRisk.label}</div>
            </div>
          </div>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:12px 0;">
          ${bodyHtml}
          <div style="margin-top:18px;color:#cfd8dc;font-size:0.95rem;">Generated: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `;

    // Open new window and print
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) {
      alert("Popup blocked. Allow popups to export PDF.");
      return;
    }
    w.document.open();
    w.document.write(printableContent);
    w.document.close();
    // Give the new window a moment to render before printing
    setTimeout(() => {
      try {
        w.focus();
        w.print();
        // Optionally close after print dialog opens (some browsers block close)
        // w.close();
      } catch (err) {
        console.error("Print failed:", err);
      }
    }, 300);
  });

  btnRow.appendChild(downloadJsonBtn);
  btnRow.appendChild(exportPdfBtn);
  container.appendChild(btnRow);
}



/* ===================== ERROR SANITIZATION ===================== */
function formatFirebaseError(code) {
  const map = {
    "auth/invalid-email": "Invalid email format",
    "auth/wrong-password": "Incorrect password",
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/email-already-in-use": "Email already registered",
    "auth/network-request-failed": "Network error – check your connection"
  };
  return map[code] || "Authentication error occurred";
}

/* ===================== INACTIVITY TIMEOUT ===================== */
let inactivityTimeout;
const MAX_IDLE_TIME = 10 * 60 * 1000;
function startInactivityTimer() {
  function resetTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(async () => {
      alert("Session expired due to inactivity.");
      await signOut(auth);
    }, MAX_IDLE_TIME);
  }
  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keypress", resetTimer);
  window.addEventListener("click", resetTimer);
  window.addEventListener("scroll", resetTimer);
  resetTimer();
}


/* ===================== GLOBAL VARIABLES ===================== */

const levelButtons = document.querySelectorAll(".level-buttons button");
const quizArea = document.getElementById("quizArea");
const questionText = document.getElementById("questionText");
const answerButtons = document.getElementById("answerButtons");
const nextBtn = document.getElementById("nextQuestionBtn");
const questionCounter = document.getElementById("questionCounter");
const quizProgressBar = document.getElementById("quizProgressBar");

const quizResult = document.getElementById("quizResult");
const finalScore = document.getElementById("finalScore");
const finalLevel = document.getElementById("finalLevel");
const performanceRating = document.getElementById("performanceRating");

let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedLevel = "";

/* ===================== QUESTION BANK ===================== */

const questionBank = {
  beginner: [
    { question: "What does XSS stand for?", answers: ["Cross Site Scripting","Extra Secure System","Extended Server Script","Cross Security Scan"], correct: 0 },
    { question: "Which port does HTTPS use?", answers: ["80","22","443","21"], correct: 2 },
    { question: "What is a firewall used for?", answers: ["Encrypt data","Filter network traffic","Store passwords","Host websites"], correct: 1 },
    { question: "Which protocol is used to securely transfer files?", answers: ["FTP","HTTP","SFTP","Telnet"], correct: 2 },
    { question: "What does VPN stand for?", answers: ["Virtual Private Network","Verified Protected Node","Virtual Public Network","Variable Private Network"], correct: 0 },
    { question: "What does HTTP stand for?", answers: ["HyperText Transfer Protocol","High Transfer Text Process","Hyper Terminal Transport Protocol","Host Transfer Tool Protocol"], correct: 0 },
    { question: "Which of the following is an example of strong password practice?", answers: ["Using your name","Using 123456","Using a long random mix of characters","Using your birthdate"], correct: 2 },
    { question: "What is phishing?", answers: ["A network scan","A type of malware","A social engineering attack","A firewall rule"], correct: 2 },
    { question: "What does malware mean?", answers: ["Managed software","Malicious software","Manual hardware","Mainframe loader"], correct: 1 },
    { question: "Which device connects multiple devices within the same network?", answers: ["Router","Switch","Firewall","Modem"], correct: 1 }
  ],

  intermediate: [
    { question: "What does SQL Injection target?", answers: ["Firewalls","Databases","DNS Servers","Routers"], correct: 1 },
    { question: "What is the purpose of hashing passwords?", answers: ["Speed up login","Compress data","Store securely","Encrypt emails"], correct: 2 },
    { question: "Which tool is commonly used for network scanning?", answers: ["Wireshark","Nmap","Metasploit","Burp Suite"], correct: 1 },
    { question: "What does CSRF stand for?", answers: ["Cross Site Request Forgery","Critical Server Response Failure","Cross Security Routing Function","Client Side Remote Function"], correct: 0 },
    { question: "What is the purpose of a Content Security Policy (CSP)?", answers: ["Improve speed","Prevent XSS attacks","Encrypt passwords","Hide source code"], correct: 1 },
    { question: "Which HTTP status code means 'Unauthorized'?", answers: ["200","301","401","500"], correct: 2 },
    { question: "What does TLS primarily provide?", answers: ["File compression","Encryption of data in transit","Database backup","Firewall filtering"], correct: 1 },
    { question: "Which tool is commonly used for web vulnerability testing?", answers: ["Nmap","Burp Suite","John the Ripper","Aircrack-ng"], correct: 1 },
    { question: "What is brute-force attack?", answers: ["Guessing credentials repeatedly","Injecting SQL","Sniffing packets","DNS poisoning"], correct: 0 },
    { question: "What does MFA stand for?", answers: ["Multi-Factor Authentication","Manual Firewall Access","Main File Authorization","Managed Filter Access"], correct: 0 },
    { question: "Which layer does HTTPS operate on?", answers: ["Application","Transport","Network","Physical"], correct: 0 }
  ],

  advanced: [
    { question: "What is a zero-day vulnerability?", answers: ["A patched exploit","An exploit known for years","A vulnerability unknown to the vendor","A firewall misconfiguration"], correct: 2 },
    { question: "What is privilege escalation?", answers: ["Encrypting traffic","Gaining higher access rights","Scanning open ports","Changing DNS records"], correct: 1 },
    { question: "What does IDS stand for?", answers: ["Intrusion Detection System","Internal Data Service","Internet Domain Server","Integrated Defense Software"], correct: 0 },
    { question: "Which attack involves intercepting communication?", answers: ["Brute Force","Man-in-the-Middle","Phishing","DDoS"], correct: 1 },
    { question: "What is the purpose of salting passwords?", answers: ["Make passwords shorter","Prevent rainbow table attacks","Encrypt the database","Increase login speed"], correct: 1 },
    { question: "What type of vulnerability allows attackers to execute scripts in a victim’s browser?", answers: ["SQL Injection","XSS","CSRF","Directory Traversal"], correct: 1 },
    { question: "What is the main goal of a DDoS attack?", answers: ["Steal passwords","Overwhelm a system with traffic","Inject malware","Encrypt files"], correct: 1 },
    { question: "What does SSRF stand for?", answers: ["Server Side Request Forgery","Secure Server Response Function","System Scan Risk Factor","Server Security Routing Framework"], correct: 0 },
    { question: "Which principle means users should only have access necessary for their role?", answers: ["Defense in Depth","Zero Trust","Least Privilege","Encryption Standard"], correct: 2 },
    { question: "What is a hash collision?", answers: ["Two inputs producing the same hash","Encrypted password","Database crash","Firewall misrule"], correct: 0 },
    { question: "Which attack targets trust between two communicating systems?", answers: ["Man-in-the-Middle","SQL Injection","Phishing","Port Scanning"], correct: 0 },

    /* ===== CODE QUESTIONS ===== */

    {
      question: `What vulnerability exists in this code?

app.get("/user", (req, res) => {
  const query = "SELECT * FROM users WHERE id = " + req.query.id;
  db.query(query);
});`,
      answers: ["XSS", "SQL Injection", "CSRF", "Broken Authentication"],
      correct: 1,
      explanation: "User input is concatenated directly into SQL query without sanitization.",
      category: "OWASP A03 - Injection",
      type: "code"
    },

    {
      question: `What is the security issue in this HTML?

<input type="text" value="{{userInput}}">`,
      answers: ["Secure coding", "XSS risk", "CSRF token leak", "Clickjacking"],
      correct: 1,
      explanation: "If userInput is not sanitized, it can inject malicious scripts.",
      category: "OWASP A03 - Injection",
      type: "code"
    },

    /* ===== LOG QUESTIONS ===== */

    {
      question: `Log Entry:
192.168.1.15 - - [10/Feb/2026] "GET /login.php?id=1' OR '1'='1 HTTP/1.1" 200

What does this indicate?`,
      answers: ["Normal login attempt", "SQL Injection attempt", "DDoS attack", "Port scan"],
      correct: 1,
      explanation: "The payload ' OR '1'='1 is a classic SQL Injection pattern.",
      category: "OWASP A03 - Injection",
      type: "log"
    },

    {
      question: `Log Entry:
Multiple failed login attempts from same IP within seconds.

What attack is likely occurring?`,
      answers: ["CSRF", "Brute Force", "XSS", "Privilege Escalation"],
      correct: 1,
      explanation: "Rapid repeated login attempts indicate brute-force attack.",
      category: "OWASP A07 - Identification and Authentication Failures",
      type: "log"
    },

    /* ===== SCENARIO QUESTIONS ===== */

    {
      question: "A user uploads a .php file disguised as an image and it executes on the server. What vulnerability is present?",
      answers: ["Broken Access Control", "Unrestricted File Upload", "XSS", "SSRF"],
      correct: 1,
      explanation: "The server failed to properly validate uploaded file types.",
      category: "OWASP A05 - Security Misconfiguration",
      type: "scenario"
    },

    {
      question: "An attacker modifies a hidden form field before submission to change product price. What is this an example of?",
      answers: ["Client-side manipulation", "SQL Injection", "CSRF", "DDoS"],
      correct: 0,
      explanation: "Client-side values can be modified unless validated server-side.",
      category: "OWASP A01 - Broken Access Control",
      type: "scenario"
    },

    /* ===== OUTPUT QUESTIONS ===== */

    {
      question: `Scan Output:
Missing Header: X-Frame-Options

What risk does this create?`,
      answers: ["SQL Injection", "Clickjacking", "Privilege Escalation", "Hash Collision"],
      correct: 1,
      explanation: "Missing X-Frame-Options allows clickjacking attacks.",
      category: "OWASP A05 - Security Misconfiguration",
      type: "output"
    },

    {
      question: `Scan Output:
Server responds with: Server: Apache/2.4.49

Why is this risky?`,
      answers: ["It improves performance", "It reveals version info for attackers", "It encrypts traffic", "It blocks scanning"],
      correct: 1,
      explanation: "Version disclosure helps attackers target known vulnerabilities.",
      category: "OWASP A05 - Security Misconfiguration",
      type: "output"
    }
  ]
};


/* ===================== START QUIZ ===================== */

levelButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedLevel = button.dataset.level;
    currentQuestions = questionBank[selectedLevel];
    currentQuestionIndex = 0;
    score = 0;

    quizArea.classList.remove("hidden");
    quizResult.classList.add("hidden");

    showQuestion();
  });
});

/* ===================== SHOW QUESTION ===================== */

function showQuestion() {
  resetState();

  const questionObj = currentQuestions[currentQuestionIndex];

  questionText.textContent = questionObj.question;

  // Category label
  const categoryLabel = document.createElement("div");
  categoryLabel.classList.add("category-label");
  categoryLabel.textContent = questionObj.category;
  quizArea.prepend(categoryLabel);

  questionObj.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.classList.add("answer-btn");
    button.addEventListener("click", () => selectAnswer(index));
    answerButtons.appendChild(button);
  });

  questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;

  quizProgressBar.style.width =
    ((currentQuestionIndex + 1) / currentQuestions.length) * 100 + "%";
}

/* ===================== RESET ===================== */

function resetState() {
  nextBtn.classList.add("hidden");
  answerButtons.innerHTML = "";

  const oldCategory = document.querySelector(".category-label");
  if (oldCategory) oldCategory.remove();
}

/* ===================== SELECT ANSWER ===================== */

function selectAnswer(selectedIndex) {
  const questionObj = currentQuestions[currentQuestionIndex];

  const buttons = document.querySelectorAll(".answer-btn");

  buttons.forEach((btn, index) => {
    btn.disabled = true;

    if (index === questionObj.correct) {
      btn.classList.add("correct");
    }

    if (index === selectedIndex && index !== questionObj.correct) {
      btn.classList.add("wrong");
    }
  });

  if (selectedIndex === questionObj.correct) {
    score++;
  }

  // Show explanation
  const explanationBox = document.createElement("div");
  explanationBox.classList.add("explanation-box");
  explanationBox.innerHTML = `<strong>Explanation:</strong> ${questionObj.explanation}`;
  answerButtons.appendChild(explanationBox);

  nextBtn.classList.remove("hidden");
}

/* ===================== NEXT QUESTION ===================== */

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < currentQuestions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

/* ===================== RESULTS ===================== */

function showResults() {
  quizArea.classList.add("hidden");
  quizResult.classList.remove("hidden");

  finalScore.textContent = score;
  finalLevel.textContent = selectedLevel;

  const percentage = (score / currentQuestions.length) * 100;
  performanceRating.textContent = awardBadge(percentage);
}

/* ===================== BADGE SYSTEM ===================== */

function awardBadge(percentage) {
  if (percentage === 100) return "🏆 Cybersecurity Master";
  if (percentage >= 80) return "🥇 Security Expert";
  if (percentage >= 60) return "🥈 Security Analyst";
  if (percentage >= 40) return "🥉 Security Learner";
  return "📘 Beginner – Keep Practicing!";
}

/* ===================== CRYPTO PLAYGROUND (drop-in) ===================== */
(function () {
  // Run after DOM ready (if your main file already wraps in DOMContentLoaded, this is safe)
  document.addEventListener('DOMContentLoaded', () => {
    // Defensive lookups
    const cryptoSection = document.getElementById('crypto');
    if (!cryptoSection) return console.debug('Crypto section not found, skipping initialization.');

    const $ = id => document.getElementById(id);

    // Elements (cp* ids)
    const genKeyBtn = $('cpGenKeyBtn');
    const exportPubBtn = $('cpExportPubBtn');
    const exportPrivBtn = $('cpExportPrivBtn');
    const signBtn = $('cpSignBtn');
    const verifyBtn = $('cpVerifyBtn');
    const signMessage = $('cpSignMessage');
    const signatureOut = $('cpSignatureOut');
    const hashBtn = $('cpHashBtn');
    const hashInput = $('cpHashInput');
    const hashOut = $('cpHashOut');
    const copyHash = $('cpCopyHash');
    const deriveBtn = $('cpDeriveBtn');
    const encryptBtn = $('cpEncryptBtn');
    const decryptBtn = $('cpDecryptBtn');
    const plaintext = $('cpPlaintext');
    const cipherOut = $('cpCipherOut');
    const pubKeyOut = $('cpPubKey');
    const privKeyOut = $('cpPrivKey');
    const derivedOut = $('cpDerivedOut');
    const opLogEl = $('cpOpLog');
    const downloadReportBtn = $('cpDownloadReport');
    const clearLogBtn = $('cpClearLog');

    // Auth-gated menu item (if present)
    const cryptoMenu = document.getElementById('cryptoMenu');

    // If critical UI missing, bail quietly
    if (!genKeyBtn || !signBtn || !hashBtn) {
      console.debug('Crypto UI incomplete, aborting initialization.');
      return;
    }

    // State
    let keyPair = null;           // CryptoKeyPair for ECDSA (sign/verify)
    let exportedPub = null;       // base64 JWK public
    let exportedPriv = null;      // base64 JWK private
    let derivedKeyRaw = null;     // Uint8Array derived bits
    let opLog = [];

    // Helpers
    const toBase64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
    const fromBase64 = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const bufToHex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    const nowISO = () => new Date().toISOString();

    function logOp(entry) {
      opLog.unshift({ ts: nowISO(), ...entry });
      opLogEl.textContent = JSON.stringify(opLog, null, 2);
    }

    async function exportKeyToBase64Jwk(key) {
      const jwk = await crypto.subtle.exportKey('jwk', key);
      return btoa(JSON.stringify(jwk));
    }

    // UI helpers
    function setKeyStatus(text) { const el = $('cpKeyStatus'); if (el) el.textContent = text; }
    function safeAlert(msg) { /* keep non-blocking in production; use alert for now */ alert(msg); }

    /* ===================== AUTH GATING (same pattern as scanner) ===================== */
    async function ensureAuthenticated() {
      if (typeof auth === 'undefined' || !auth?.currentUser) {
        safeAlert('You must be logged in to use the Crypto Playground.');
        return false;
      }
      return true;
    }

    // Show/hide crypto menu when auth changes (if auth exists)
    if (typeof onAuthStateChanged === 'function') {
      onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified !== false) {
          cryptoMenu?.classList.remove('hidden');
        } else {
          cryptoMenu?.classList.add('hidden');
        }
      });
    }

    /* ===================== KEY GENERATION & EXPORT ===================== */
    genKeyBtn.addEventListener('click', async () => {
      if (!await ensureAuthenticated()) return;
      try {
        // Generate ECDSA P-256 key pair for sign/verify
        keyPair = await crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' },
          true,
          ['sign', 'verify']
        );
        exportedPub = await exportKeyToBase64Jwk(keyPair.publicKey);
        exportedPriv = await exportKeyToBase64Jwk(keyPair.privateKey);
        pubKeyOut.textContent = exportedPub;
        privKeyOut.textContent = exportedPriv;
        setKeyStatus('Key Generated');
        logOp({ action: 'generate-key', detail: 'ECDSA P-256 key pair generated' });
      } catch (err) {
        console.error('Key generation failed', err);
        safeAlert('Key generation failed: ' + err.message);
      }
    });

    exportPubBtn?.addEventListener('click', () => {
      if (!exportedPub) { safeAlert('No public key available'); return; }
      const blob = new Blob([exportedPub], { type: 'application/jwk' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'public_key.jwk.txt';
      a.click();
      URL.revokeObjectURL(a.href);
      logOp({ action: 'export-public' });
    });

    exportPrivBtn?.addEventListener('click', () => {
      if (!exportedPriv) { safeAlert('No private key available'); return; }
      const blob = new Blob([exportedPriv], { type: 'application/jwk' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'private_key.jwk.txt';
      a.click();
      URL.revokeObjectURL(a.href);
      logOp({ action: 'export-private' });
    });

    /* ===================== SIGN / VERIFY ===================== */
    signBtn.addEventListener('click', async () => {
      if (!await ensureAuthenticated()) return;
      if (!keyPair) { safeAlert('Generate a key pair first'); return; }
      const msg = (signMessage.value || '');
      try {
        const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: { name: 'SHA-256' } }, keyPair.privateKey, new TextEncoder().encode(msg));
        const b64 = toBase64(sig);
        signatureOut.value = b64;
        logOp({ action: 'sign', messagePreview: msg.slice(0,120), signature: b64 });
      } catch (err) {
        console.error('Sign failed', err);
        safeAlert('Sign failed: ' + err.message);
      }
    });

    verifyBtn.addEventListener('click', async () => {
      if (!await ensureAuthenticated()) return;
      if (!keyPair) { safeAlert('Generate a key pair first'); return; }
      const msg = (signMessage.value || '');
      const sigB64 = (signatureOut.value || '');
      if (!sigB64) { safeAlert('No signature present'); return; }
      try {
        const ok = await crypto.subtle.verify(
          { name: 'ECDSA', hash: { name: 'SHA-256' } },
          keyPair.publicKey,
          fromBase64(sigB64),
          new TextEncoder().encode(msg)
        );
        safeAlert(ok ? 'Signature valid ✅' : 'Signature invalid ❌');
        logOp({ action: 'verify', valid: ok });
      } catch (err) {
        console.error('Verify failed', err);
        safeAlert('Verify failed: ' + err.message);
      }
    });

    /* ===================== HASH ===================== */
    hashBtn.addEventListener('click', async () => {
      const txt = (hashInput.value || '');
      try {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
        const hex = bufToHex(digest);
        hashOut.textContent = hex;
        logOp({ action: 'hash', inputPreview: txt.slice(0,120), sha256: hex });
      } catch (err) {
        console.error('Hash failed', err);
        safeAlert('Hash failed: ' + err.message);
      }
    });

    copyHash?.addEventListener('click', () => {
      const v = hashOut.textContent || '';
      navigator.clipboard?.writeText(v).catch(() => safeAlert('Copy failed'));
    });

    /* ===================== DERIVE / ENCRYPT / DECRYPT ===================== */
    deriveBtn.addEventListener('click', async () => {
      if (!await ensureAuthenticated()) return;
      if (!exportedPub || !exportedPriv) { safeAlert('Generate keys first'); return; }
      try {
        // Import JWKs as ECDH keys and derive bits (demo: derive with own public)
        const jwkPub = JSON.parse(atob(exportedPub));
        const jwkPriv = JSON.parse(atob(exportedPriv));
        const pubKey = await crypto.subtle.importKey('jwk', jwkPub, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
        const privKey = await crypto.subtle.importKey('jwk', jwkPriv, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: pubKey }, privKey, 256);
        derivedKeyRaw = new Uint8Array(bits);
        derivedOut.textContent = toBase64(bits);
        logOp({ action: 'derive', detail: 'Derived 256 bits (demo reuse)' });
      } catch (err) {
        console.error('Derive failed', err);
        safeAlert('Derive failed: ' + err.message);
      }
    });

    async function importAesFromRaw(raw) {
      return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    }

    encryptBtn.addEventListener('click', async () => {
      if (!await ensureAuthenticated()) return;
      if (!derivedKeyRaw) { safeAlert('Derive a shared key first'); return; }
      const pt = (plaintext.value || '');
      const iv = crypto.getRandomValues(new Uint8Array(12));
      try {
        const aesKey = await importAesFromRaw(derivedKeyRaw);
        const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, new TextEncoder().encode(pt));
        const payload = { iv: toBase64(iv), ct: toBase64(ct) };
        cipherOut.value = JSON.stringify(payload);
        logOp({ action: 'encrypt', plaintextPreview: pt.slice(0,120) });
      } catch (err) {
        console.error('Encrypt failed', err);
        safeAlert('Encrypt failed: ' + err.message);
      }
    });

    decryptBtn.addEventListener('click', async () => {
      if (!await ensureAuthenticated()) return;
      if (!derivedKeyRaw) { safeAlert('Derive a shared key first'); return; }
      const payloadText = (cipherOut.value || '');
      if (!payloadText) { safeAlert('No ciphertext present'); return; }
      try {
        const payload = JSON.parse(payloadText);
        const iv = fromBase64(payload.iv);
        const ct = fromBase64(payload.ct);
        const aesKey = await importAesFromRaw(derivedKeyRaw);
        const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct);
        const pt = new TextDecoder().decode(ptBuf);
        safeAlert('Decrypted: ' + pt);
        logOp({ action: 'decrypt', plaintextPreview: pt.slice(0,120) });
      } catch (err) {
        console.error('Decrypt failed', err);
        safeAlert('Decrypt failed: ' + err.message);
      }
    });

    /* ===================== REPORTS (JSON + Printable) ===================== */
    downloadReportBtn?.addEventListener('click', () => {
      const report = {
        generatedAt: nowISO(),
        keyStatus: $('cpKeyStatus')?.textContent || 'N/A',
        operations: opLog
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'crypto_playground_report.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    clearLogBtn?.addEventListener('click', () => {
      opLog = [];
      opLogEl.textContent = 'No operations yet.';
    });

    /* ===================== NAV HELPERS ===================== */
    // Programmatically open crypto section and set menu active
    window.openCryptoSection = function () {
      document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
      cryptoSection.classList.remove('hidden');
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      document.querySelector('.menu a[data-target="crypto"]')?.classList.add('active');
      // focus first interactive element
      setTimeout(() => $('cpSignMessage')?.focus(), 50);
    };

    // If menu item clicked, navigation handler in your main nav code will show the section.
    // Initialization placeholders
    pubKeyOut.textContent = exportedPub || '—';
    privKeyOut.textContent = exportedPriv || '—';
    derivedOut.textContent = '—';
    opLogEl.textContent = 'No operations yet.';
  });
})();




/* ===================== TLS VALIDATION — safe, whitelist enforced ===================== */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Defensive element lookups
      const tlsSection = document.getElementById('tls');
      if (!tlsSection) return console.debug('TLS section not found, skipping init.');

      const $ = id => document.getElementById(id);
      const runBtn = $('tlsRunBtn');
      const clearBtn = $('tlsClearBtn');
      const targetInput = $('tlsTargetUrl');
      const modeSelect = $('tlsCheckMode');
      const consent = $('tlsConsent');
      const progress = $('tlsProgress');
      const output = $('tlsOutput');
      const certStatus = $('tlsCertStatus');
      const issuerOut = $('tlsIssuer');
      const validityOut = $('tlsValidity');
      const cipherOut = $('tlsCipher');
      const headersOut = $('tlsHeaders');
      const logOut = $('tlsLog');
      const downloadBtn = $('tlsDownloadReport');
      const clearLogBtn = $('tlsClearLog');
      const tlsMenu = document.getElementById('tlsMenu');

      // ===== Configuration: allowed hosts (edit to match your demo/lab hosts) =====
      const ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '::1',
        'juice-shop.herokuapp.com',
        'owasp-juice-shop.github.io',
        '.example-labs.local',   // allow subdomains of example-labs.local
        'dvwa.local',
        'sandisomayekiso.github.io'
      ];

      // ===== Helpers =====
      function esc(s) { return s == null ? '—' : String(s); }

      function normalizeHostFromInput(input) {
        try {
          const u = new URL(input.includes('://') ? input : `https://${input}`);
          return u.hostname.toLowerCase();
        } catch (e) {
          return null;
        }
      }

      function isLocalHostName(host) {
        if (!host) return false;
        return host === 'localhost' || host === '127.0.0.1' || host === '::1';
      }

      function isHostAllowed(host) {
        if (!host) return false;
        if (isLocalHostName(host)) return true;
        if (ALLOWED_HOSTS.includes(host)) return true;
        for (const allowed of ALLOWED_HOSTS) {
          if (allowed.startsWith('.')) {
            const base = allowed.slice(1).toLowerCase();
            if (host === base) return true;
            if (host.endsWith('.' + base)) return true;
          }
        }
        return false;
      }

      // ===== UI helpers (non-destructive) =====
      // Show TLS section only; do not hide other sections
      window.openTlsSection = function () {
        try {
          tlsSection.classList.remove('hidden');
          document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
          document.querySelector('.menu a[data-target="tls"]')?.classList.add('active');
          setTimeout(() => targetInput?.focus(), 50);
        } catch (e) {
          console.warn('openTlsSection failed', e);
        }
      };

      window.closeTlsSection = function () {
        try {
          tlsSection.classList.add('hidden');
          document.querySelector('.menu a[data-target="tls"]')?.classList.remove('active');
        } catch (e) {
          console.warn('closeTlsSection failed', e);
        }
      };

      // ===== Simple operation log =====
      let tlsLog = [];
      function logOp(entry) {
        try {
          tlsLog.unshift({ ts: new Date().toISOString(), ...entry });
          if (logOut) logOut.textContent = JSON.stringify(tlsLog, null, 2);
        } catch (e) {
          console.warn('logOp failed', e);
        }
      }

      // ===== Reset UI =====
      function resetUI() {
        try {
          if (progress) { progress.style.width = '0%'; progress.innerText = '0%'; }
          if (output) output.value = '';
          if (certStatus) certStatus.textContent = 'No Check';
          if (issuerOut) issuerOut.textContent = '—';
          if (validityOut) validityOut.textContent = '—';
          if (cipherOut) cipherOut.textContent = '—';
          if (headersOut) headersOut.textContent = '—';
        } catch (e) {
          console.warn('resetUI failed', e);
        }
      }

      // ===== Client-side TLS info attempt (limited) =====
      async function clientSideCheck(url) {
        const result = { reachable: false, status: null, headers: {}, notes: [] };
        try {
          const resp = await fetch(url, { method: 'HEAD', mode: 'cors' });
          result.reachable = true;
          result.status = resp.status;
          resp.headers.forEach((v, k) => { result.headers[k] = v; });
        } catch (err) {
          result.notes.push('Fetch failed: ' + (err && err.message ? err.message : String(err)));
        }
        return result;
      }

      // ===== Main run handler (defensive, whitelist enforced) =====
      async function runValidation() {
        try {
          const raw = (targetInput?.value || '').trim();
          const mode = modeSelect?.value || 'quick';
          const hasConsent = !!(consent && consent.checked);

          if (!raw) {
            if (output) output.value = 'Enter a valid URL or host.';
            return;
          }

          const host = normalizeHostFromInput(raw);
          if (!host) {
            if (output) output.value = 'Invalid URL format.';
            return;
          }

          // Enforce whitelist (localhost + allowed demo/lab hosts)
          if (!isHostAllowed(host)) {
            if (output) output.value = `Target not allowed. Only localhost (127.0.0.1 / ::1) and approved demo/lab hosts may be tested.\nRequested host: ${host}`;
            logOp({ action: 'blocked-target', host, mode });
            return;
          }

          if (!hasConsent) {
            if (output) output.value = 'You must confirm permission to test this domain.';
            return;
          }

          // If full scans require authentication, check auth.currentUser if available (UI convenience only)
          if (mode === 'full' && typeof auth !== 'undefined') {
            const user = auth.currentUser;
            if (!user) {
              if (output) output.value = 'Full scans require authentication. Please sign in.';
              return;
            }
          }

          // Start progress and run client-side quick check
          if (progress) { progress.style.width = '10%'; progress.innerText = '10%'; }
          resetUI();
          logOp({ action: 'start', raw, host, mode });

          if (progress) { progress.style.width = '30%'; progress.innerText = '30%'; }
          const quick = await clientSideCheck(raw);
          if (progress) { progress.style.width = '60%'; progress.innerText = '60%'; }

          if (output) output.value = `Reachable: ${quick.reachable}\nStatus: ${quick.status || 'N/A'}\nNotes: ${quick.notes.join('; ') || 'None'}`;
          if (headersOut) headersOut.textContent = JSON.stringify(quick.headers, null, 2);

          if (certStatus) certStatus.textContent = quick.reachable ? 'HTTPS Available' : 'No HTTPS';
          if (issuerOut) issuerOut.textContent = 'Unavailable (browser restricted)';
          if (validityOut) validityOut.textContent = 'Unavailable (browser restricted)';
          if (cipherOut) cipherOut.textContent = 'Unavailable (browser restricted)';

          // Full mode: call backend only if configured and host allowed (backend must re-validate)
          if (mode === 'full') {
            const backendUrl = window.TLS_BACKEND_SCAN_URL || null;
            if (backendUrl) {
              try {
                if (progress) { progress.style.width = '75%'; progress.innerText = '75%'; }
                const resp = await fetch(backendUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ target: raw, mode, host })
                });
                if (resp.ok) {
                  const data = await resp.json();
                  if (issuerOut) issuerOut.textContent = esc(data.issuer);
                  if (validityOut) validityOut.textContent = esc(data.valid_from) + ' → ' + esc(data.valid_to);
                  if (cipherOut) cipherOut.textContent = esc(data.cipher);
                  if (headersOut) headersOut.textContent = JSON.stringify(data.headers || {}, null, 2);
                  if (output) output.value += `\n\nFull scan summary:\n${esc(data.summary || 'No summary')}`;
                  if (certStatus) certStatus.textContent = esc(data.overall || 'Checked');
                  logOp({ action: 'full-scan', result: data.overall || 'unknown', host });
                } else {
                  if (output) output.value += `\n\nFull scan failed: ${resp.status}`;
                  logOp({ action: 'full-scan-failed', status: resp.status, host });
                }
              } catch (err) {
                if (output) output.value += `\n\nFull scan error: ${err && err.message ? err.message : String(err)}`;
                logOp({ action: 'full-scan-error', error: err && err.message ? err.message : String(err), host });
              }
            } else {
              if (output) output.value += '\n\nFull mode selected but no backend scan endpoint configured.';
            }
          }

          if (progress) { progress.style.width = '100%'; progress.innerText = '100%'; }
          logOp({ action: 'complete', raw, host, mode });
        } catch (e) {
          console.error('runValidation error', e);
          try { if (output) output.value = 'An error occurred during validation.'; } catch (_) {}
          logOp({ action: 'error', error: e && e.message ? e.message : String(e) });
        }
      }

      // ===== Wire buttons (defensive) =====
      try {
        if (runBtn) runBtn.addEventListener('click', runValidation);
        if (clearBtn) clearBtn.addEventListener('click', () => {
          try {
            if (targetInput) targetInput.value = '';
            if (consent) consent.checked = false;
            resetUI();
          } catch (e) { console.warn('clearBtn handler failed', e); }
        });
      } catch (e) {
        console.warn('Button wiring failed', e);
      }

      // ===== Report download and log clear =====
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          try {
            const report = { generatedAt: new Date().toISOString(), target: targetInput?.value || '', log: tlsLog };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `tls_report_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
          } catch (e) { console.warn('download failed', e); }
        });
      }

      if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
          tlsLog = [];
          if (logOut) logOut.textContent = 'No operations yet.';
        });
      }

      // ===== Show/hide menu item based on auth state (non-destructive) =====
      if (typeof onAuthStateChanged === 'function' && tlsMenu) {
        try {
          onAuthStateChanged(auth, (user) => {
            try {
              if (user && user.emailVerified !== false) {
                tlsMenu.classList.remove('hidden');
              } else {
                tlsMenu.classList.add('hidden');
              }
            } catch (e) { console.warn('onAuthStateChanged handler error', e); }
          });
        } catch (e) {
          console.warn('Failed to attach onAuthStateChanged for TLS menu', e);
        }
      }

      // Initialize UI
      resetUI();
    } catch (outerErr) {
      // Top-level safety: log but do not break the rest of the app
      console.error('TLS init failed (non-fatal):', outerErr);
    }
  });
})();



/* ===================== INPUT FIELD ANALYSIS — safe, whitelist enforced ===================== */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // Defensive lookups
      const section = document.getElementById('input-analysis');
      if (!section) return console.debug('Input Analysis section not found, skipping init.');

      const $ = id => document.getElementById(id);
      const runBtn = $('ifaRunBtn');
      const clearBtn = $('ifaClearBtn');
      const targetInput = $('ifaTargetUrl');
      const selectorInput = $('ifaSelector');
      const consent = $('ifaConsent');
      const statusBadge = $('ifaStatus');
      const summaryOut = $('ifaSummary');
      const inputsOut = $('ifaInputs');
      const issuesOut = $('ifaIssues');
      const logOut = $('ifaLog');
      const downloadBtn = $('ifaDownloadReport');
      const clearLogBtn = $('ifaClearLog');
      const ifaMenu = document.getElementById('ifaMenu');

      // ===== Configuration: allowed hosts (edit to match your demo/lab hosts) =====
      const ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '::1',
        'juice-shop.herokuapp.com',
        'owasp-juice-shop.github.io',
        '.example-labs.local',
        'dvwa.local',
        'sandisomayekiso.github.io'
      ];

      // ===== Helpers =====
      const esc = s => s == null ? '—' : String(s);

      function normalizeHostFromInput(input) {
        try {
          const u = new URL(input.includes('://') ? input : `https://${input}`);
          return u.hostname.toLowerCase();
        } catch (e) {
          return null;
        }
      }

      function isLocalHostName(host) {
        if (!host) return false;
        return host === 'localhost' || host === '127.0.0.1' || host === '::1';
      }

      function isHostAllowed(host) {
        if (!host) return false;
        if (isLocalHostName(host)) return true;
        if (ALLOWED_HOSTS.includes(host)) return true;
        for (const allowed of ALLOWED_HOSTS) {
          if (allowed.startsWith('.')) {
            const base = allowed.slice(1).toLowerCase();
            if (host === base) return true;
            if (host.endsWith('.' + base)) return true;
          }
        }
        return false;
      }

      // ===== Operation log (defensive) =====
      let opLog = [];
      function logOp(entry) {
        try {
          opLog.unshift({ ts: new Date().toISOString(), ...entry });
          if (logOut) logOut.textContent = JSON.stringify(opLog, null, 2);
        } catch (e) {
          console.warn('logOp failed', e);
        }
      }

      // ===== Reset UI =====
      function resetUI() {
        try {
          if (statusBadge) statusBadge.textContent = 'Idle';
          if (summaryOut) summaryOut.value = '';
          if (inputsOut) inputsOut.textContent = '—';
          if (issuesOut) issuesOut.textContent = '—';
        } catch (e) {
          console.warn('resetUI failed', e);
        }
      }

      // ===== Client-side fetch and DOM parsing (limited by CORS) =====
      async function fetchPageHtml(url) {
        try {
          const resp = await fetch(url, { method: 'GET', mode: 'cors' });
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          return await resp.text();
        } catch (err) {
          throw new Error('Fetch failed: ' + (err && err.message ? err.message : String(err)));
        }
      }

      function analyzeFormHtml(html, formSelector) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const forms = formSelector ? Array.from(doc.querySelectorAll(formSelector)) : Array.from(doc.querySelectorAll('form'));
        const findings = [];
        const inputs = [];

        forms.forEach((form, fi) => {
          const formId = form.id || `form[${fi}]`;
          const formInputs = Array.from(form.querySelectorAll('input, textarea, select'));
          formInputs.forEach((inp, ii) => {
            const name = inp.getAttribute('name') || inp.id || `input[${ii}]`;
            const type = inp.tagName.toLowerCase() === 'input' ? (inp.getAttribute('type') || 'text') : inp.tagName.toLowerCase();
            const attrs = {
              id: inp.id || '',
              name: inp.getAttribute('name') || '',
              type,
              autocomplete: inp.getAttribute('autocomplete') || '',
              maxlength: inp.getAttribute('maxlength') || '',
              required: inp.hasAttribute('required'),
              pattern: inp.getAttribute('pattern') || ''
            };
            inputs.push({ form: formId, name, attrs });

            // Heuristics for issues
            if (!attrs.autocomplete && (type === 'email' || type === 'text' || type === 'tel')) {
              findings.push({ severity: 'info', message: `${name} missing autocomplete attribute` });
            }
            if (!attrs.required && (type === 'password' || type === 'email')) {
              findings.push({ severity: 'warning', message: `${name} not marked required` });
            }
            if (type === 'text' && attrs.pattern) {
              findings.push({ severity: 'info', message: `${name} has pattern attribute` });
            }
            if (type === 'password' && attrs.autocomplete === 'off') {
              findings.push({ severity: 'info', message: `${name} has autocomplete off for password` });
            }
            if (['text','search','url','textarea'].includes(type) && !attrs.pattern && !attrs.maxlength) {
              findings.push({ severity: 'warning', message: `${name} may accept long free-form input (consider maxlength)` });
            }
          });
        });

        return { inputs, findings, formCount: forms.length };
      }

      // ===== Main run handler (whitelist enforced, defensive) =====
      async function runAnalysis() {
        try {
          const raw = (targetInput?.value || '').trim();
          const selector = (selectorInput?.value || '').trim();
          const hasConsent = !!(consent && consent.checked);

          resetUI();
          if (!raw) {
            if (summaryOut) summaryOut.value = 'Enter a valid URL.';
            return;
          }

          const host = normalizeHostFromInput(raw);
          if (!host) {
            if (summaryOut) summaryOut.value = 'Invalid URL format.';
            return;
          }

          // Enforce whitelist (localhost + allowed demo/lab hosts)
          if (!isHostAllowed(host)) {
            if (summaryOut) summaryOut.value = `Target not allowed. Only localhost (127.0.0.1 / ::1) and approved demo/lab hosts may be analyzed.\nRequested host: ${host}`;
            logOp({ action: 'blocked-target', host, selector });
            return;
          }

          if (!hasConsent) {
            if (summaryOut) summaryOut.value = 'You must confirm permission to analyze this page.';
            return;
          }

          if (statusBadge) statusBadge.textContent = 'Running';
          logOp({ action: 'start', raw, selector });

          const html = await fetchPageHtml(raw);
          logOp({ action: 'fetched', length: html.length });

          const result = analyzeFormHtml(html, selector || null);
          if (inputsOut) inputsOut.textContent = JSON.stringify(result.inputs, null, 2);
          if (issuesOut) issuesOut.textContent = JSON.stringify(result.findings, null, 2);

          const summary = [
            `Forms found: ${result.formCount}`,
            `Inputs analyzed: ${result.inputs.length}`,
            `Issues: ${result.findings.length}`
          ].join('\n');
          if (summaryOut) summaryOut.value = summary;
          if (statusBadge) statusBadge.textContent = 'Complete';
          logOp({ action: 'complete', summary });
        } catch (err) {
          try { if (summaryOut) summaryOut.value = 'Analysis failed: ' + (err && err.message ? err.message : String(err)); } catch (_) {}
          if (statusBadge) statusBadge.textContent = 'Error';
          logOp({ action: 'error', error: err && err.message ? err.message : String(err) });
        }
      }

      // ===== Wire buttons (defensive) =====
      try {
        if (runBtn) runBtn.addEventListener('click', runAnalysis);
        if (clearBtn) clearBtn.addEventListener('click', () => {
          try {
            if (targetInput) targetInput.value = '';
            if (selectorInput) selectorInput.value = '';
            if (consent) consent.checked = false;
            resetUI();
          } catch (e) { console.warn('clearBtn handler failed', e); }
        });
      } catch (e) {
        console.warn('Button wiring failed', e);
      }

      // ===== Report download and log clear =====
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
          try {
            const report = { generatedAt: new Date().toISOString(), target: targetInput?.value || '', selector: selectorInput?.value || '', log: opLog };
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `ifa_report_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
          } catch (e) { console.warn('download failed', e); }
        });
      }

      if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
          opLog = [];
          if (logOut) logOut.textContent = 'No operations yet.';
        });
      }

      // ===== Show/hide menu item based on auth state (non-destructive) =====
      if (typeof onAuthStateChanged === 'function' && ifaMenu) {
        try {
          onAuthStateChanged(auth, (user) => {
            try {
              if (user && user.emailVerified !== false) {
                ifaMenu.classList.remove('hidden');
              } else {
                ifaMenu.classList.add('hidden');
              }
            } catch (e) { console.warn('onAuthStateChanged handler error', e); }
          });
        } catch (e) {
          console.warn('Failed to attach onAuthStateChanged for IFA menu', e);
        }
      }

      // ===== Safe open/close helpers (do not hide other sections) =====
      window.openInputAnalysis = function () {
        try {
          section.classList.remove('hidden');
          document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
          document.querySelector('.menu a[data-target="input-analysis"]')?.classList.add('active');
          setTimeout(() => $('ifaTargetUrl')?.focus(), 50);
        } catch (e) { console.warn('openInputAnalysis failed', e); }
      };

      window.closeInputAnalysis = function () {
        try {
          section.classList.add('hidden');
          document.querySelector('.menu a[data-target="input-analysis"]')?.classList.remove('active');
        } catch (e) { console.warn('closeInputAnalysis failed', e); }
      };

      // Initialize UI
      resetUI();
    } catch (outerErr) {
      console.error('Input Analysis init failed (non-fatal):', outerErr);
    }
  });
})();



/* ===================== LIBRARY JS  ===================== */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('library');
    if (!section) return console.debug('Library section not found, skipping init.');

    // Elements
    const libList = document.getElementById('libList');
    const searchInput = document.getElementById('libSearch');
    const filterSelect = document.getElementById('libFilter');
    const libraryMenu = document.getElementById('libraryMenu');

    // Viewer elements
    const viewer = document.getElementById('libViewer');
    const viewerFrame = document.getElementById('libViewerFrame');
    const viewerTitle = document.getElementById('libViewerTitle');
    const viewerClose = document.getElementById('libViewerClose');
    const viewerDownload = document.getElementById('libViewerDownload');
    const viewerOpenNew = document.getElementById('libViewerOpenNew');

    
    const resources = [
      {
        id: 'r1',
        title: 'Web Security Basics (PDF)',
        description: 'Introductory guide to common web vulnerabilities and defenses.',
        url: 'https://github.com/SandisoMayekiso/cyber-lab-resources/blob/main/README.md',
        type: 'pdf',
        tags: ['intro','web','pdf']
      },
      {
        id: 'r2',
        title: 'TLS Cheat Sheet',
        description: 'Quick reference for TLS versions, ciphers and best practices.',
        url: 'https://github.com/SandisoMayekiso/cyber-lab-resources/blob/main/README.md',
        type: 'cheatsheet',
        tags: ['tls','cheatsheet','pdf']
      },
      {
        id: 'r3',
        title: 'Secure Coding Guide',
        description: 'Practical secure coding patterns for web applications.',
        url: 'https://github.com/SandisoMayekiso/cyber-lab-resources/blob/main/README.md',
        type: 'guide',
        tags: ['secure-coding','guide','pdf']
      }
    ];

    // Utility: escape text for DOM
    function esc(s) { return s == null ? '' : String(s); }

    // Render resource cards
    function renderList(items) {
      libList.innerHTML = '';
      if (!items.length) {
        libList.innerHTML = '<div class="muted">No resources found.</div>';
        return;
      }
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'lib-card';
        card.innerHTML = `
          <div class="meta">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.description)}</p>
            <div class="tags">${esc(item.type)} • ${esc(item.tags.join(', '))}</div>
          </div>
          <div class="actions">
            <button class="btn view-btn" data-id="${esc(item.id)}">View</button>
            <a class="btn secondary download-btn" data-id="${esc(item.id)}" href="${esc(item.url)}" download>Download</a>
          </div>
        `;
        libList.appendChild(card);
      });
      // Attach handlers
      libList.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', onView));
      // download links are native anchors; no extra handler required
    }

    // View handler: open modal and set iframe src
    function onView(e) {
      const id = e.currentTarget.dataset.id;
      const item = resources.find(r => r.id === id);
      if (!item) return;
      viewerTitle.textContent = item.title;
      // Use a safe viewer approach: for PDFs, use browser PDF viewer; for other types, open in iframe if allowed by CORS
      viewerFrame.src = item.url;
      viewerDownload.href = item.url;
      viewerDownload.setAttribute('download', '');
      viewerOpenNew.onclick = () => window.open(item.url, '_blank', 'noopener');
      viewer.classList.remove('hidden');
      // prevent background scroll
      document.documentElement.style.overflow = 'hidden';
    }

    // Close viewer
    function closeViewer() {
      viewer.classList.add('hidden');
      viewerFrame.src = 'about:blank';
      document.documentElement.style.overflow = '';
    }

    viewerClose.addEventListener('click', closeViewer);
    viewer.querySelector('.lib-viewer__backdrop')?.addEventListener('click', closeViewer);

    // Search & filter
    function applyFilters() {
      const q = (searchInput.value || '').trim().toLowerCase();
      const filter = filterSelect.value;
      const filtered = resources.filter(r => {
        const matchesFilter = filter === 'all' ? true : r.type === filter;
        const matchesQuery = !q || (r.title + ' ' + r.description + ' ' + r.tags.join(' ')).toLowerCase().includes(q);
        return matchesFilter && matchesQuery;
      });
      renderList(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);

    // Expose helper to open library section without forcing auth
    window.openLibrarySection = function () {
      document.querySelectorAll('.page-section').forEach(s => s.classList.add('hidden'));
      section.classList.remove('hidden');
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      document.querySelector('.menu a[data-target="library"]')?.classList.add('active');
      setTimeout(() => searchInput?.focus(), 50);
    };

    // Show/hide menu item based on auth state (do not force sections)
    if (typeof onAuthStateChanged === 'function' && libraryMenu) {
      onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified !== false) {
          libraryMenu.classList.remove('hidden');
        } else {
          libraryMenu.classList.add('hidden');
        }
      });
    }

    // Initial render
    renderList(resources);
  });
})();
