(() => {
  "use strict";
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const header = document.getElementById("site-header");
  const menu = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const timeline = document.getElementById("experience-timeline");
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submit = document.getElementById("submit-button");
  document.getElementById("current-year").textContent = new Date().getFullYear();
  root.classList.add("nav-enhanced");

  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) { closeMenu(); menu.focus(); }
  });
  document.addEventListener("click", event => { if (!header.contains(event.target)) closeMenu(); });
  window.matchMedia("(min-width: 900px)").addEventListener("change", closeMenu);

  let revealObserver;
  const countersRun = new WeakSet();
  function animateCounter(element) {
    if (countersRun.has(element)) return;
    const target = Number(element.dataset.countTo);
    if (!Number.isFinite(target)) return;
    countersRun.add(element);
    const suffix = element.dataset.countSuffix || "";
    const decimals = Math.min(4, Math.max(0, Number(element.dataset.countDecimals) || 0));
    if (motion.matches) { element.textContent = target.toFixed(decimals) + suffix; return; }
    const start = performance.now();
    function frame(time) {
      const progress = Math.min((time - start) / 1000, 1);
      const eased = 1 - (1 - progress) ** 3;
      element.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function configureReveals() {
    revealObserver?.disconnect();
    root.classList.toggle("motion-enabled", !motion.matches && "IntersectionObserver" in window);
    const elements = document.querySelectorAll(".reveal, [data-count-to]");
    if (motion.matches || !("IntersectionObserver" in window)) {
      elements.forEach(element => { element.classList.add("is-visible"); if (element.hasAttribute("data-count-to")) animateCounter(element); });
      return;
    }
    document.querySelectorAll(".stagger-group").forEach(group => {
      [...group.children].forEach((element, index) => element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`));
    });
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.hasAttribute("data-count-to")) animateCounter(entry.target);
        entry.target.querySelectorAll("[data-count-to]").forEach(animateCounter);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    elements.forEach(element => revealObserver.observe(element));
  }
  configureReveals();
  // Never leave content hidden after a browser restores a page from its back/forward cache.
  window.addEventListener("pageshow", event => { if (event.persisted) configureReveals(); });
  let scrollQueued = false;
  function updateScroll() {
    scrollQueued = false;
    header.classList.toggle("scrolled", window.scrollY > 12);
    const rect = timeline.getBoundingClientRect();
    const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (window.innerHeight * .8 - rect.top) / rect.height));
    timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
  }
  function queueScroll() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll, { passive: true });
  motion.addEventListener("change", () => { configureReveals(); queueScroll(); });
  updateScroll();

  const fields = [
    { input: form.elements.name, error: document.getElementById("name-error") },
    { input: form.elements.email, error: document.getElementById("email-error") },
    { input: form.elements.message, error: document.getElementById("message-error") },
  ];
  function validateField({ input, error }) {
    const value = input.value.trim();
    let message = "";
    if (!value) message = `Please enter your ${input.name}.`;
    else if (input.name === "email" && input.validity.typeMismatch) message = "Please enter a valid email address.";
    else if (input.minLength > 0 && value.length < input.minLength) message = `Please use at least ${input.minLength} characters.`;
    else if (input.maxLength > 0 && value.length > input.maxLength) message = `Please use no more than ${input.maxLength} characters.`;
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }
  fields.forEach(field => {
    field.input.addEventListener("blur", () => { if (field.input.value || field.input.getAttribute("aria-invalid") === "true") validateField(field); });
    field.input.addEventListener("input", () => { if (field.input.getAttribute("aria-invalid") === "true") validateField(field); });
  });
  function setStatus(message, state) { status.textContent = message; status.dataset.state = state; }
  let sending = false;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (sending) return;
    if (form.elements.website.value.trim()) { setStatus("Unable to send this message. Please try again.", "error"); return; }
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) { fields.find(field => field.input.getAttribute("aria-invalid") === "true").input.focus(); setStatus("Please check the highlighted fields.", "error"); return; }
    const accessKey = window.PORTFOLIO_CONFIG?.web3formsAccessKey?.trim();
    if (!accessKey) { setStatus("The contact form is not available yet. Please try again later.", "error"); return; }
    sending = true;
    submit.disabled = true;
    submit.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");
    setStatus("Sending your message…", "pending");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          access_key: accessKey,
          subject: "Portfolio contact — Micah Samuel",
          from_name: "Portfolio contact form",
          name: form.elements.name.value.trim(),
          email: form.elements.email.value.trim(),
          message: form.elements.message.value.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Submission rejected");
      form.reset();
      fields.forEach(({ input, error }) => { input.removeAttribute("aria-invalid"); error.textContent = ""; });
      setStatus("Thank you. Your message has been sent.", "success");
    } catch (error) {
      // Never display raw provider responses: they might contain account information.
      setStatus(error.name === "AbortError" ? "The request timed out. Delivery could not be confirmed; please try again later." : "Your message could not be sent. Please check your connection and try again.", "error");
    } finally {
      clearTimeout(timeout); sending = false; submit.disabled = false;
      submit.textContent = "Send message"; form.removeAttribute("aria-busy");
    }
  });
})();
