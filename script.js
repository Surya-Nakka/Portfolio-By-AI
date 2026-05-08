(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Smooth scrolling with reduced-motion support.
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!reduceMotion) {
    document.documentElement.style.scrollBehavior = "smooth";
  }

  // Scroll reveal animations (IntersectionObserver).
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Active section highlights in navbar.
  const navLinks = $$("a[data-nav-link]");
  const sectionIds = navLinks
    .map((a) => a.getAttribute("href"))
    .filter((href) => href && href.startsWith("#"))
    .map((href) => href.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (sections.length) {
    const sectionIO = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section.
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }

        if (!best) return;
        const id = best.target.id;
        navLinks.forEach((a) => {
          const active = a.getAttribute("href") === `#${id}`;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "page");
          else a.removeAttribute("aria-current");
        });
      },
      {
        root: null,
        // Bias towards middle of viewport for stable highlighting.
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    sections.forEach((s) => sectionIO.observe(s));
  }

  // Footer year.
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Contact form: open mail client with prefilled content.
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.elements["name"]?.value?.trim() ?? "";
      const email = form.elements["email"]?.value?.trim() ?? "";
      const message = form.elements["message"]?.value?.trim() ?? "";

      if (!name || !email || !message) return;

      const to = "suryaanakka@gmail.com";
      const subject = `Portfolio Contact | ${name}`;
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        message
      ].join("\n");

      // Build mailto link safely.
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
    });
  }
})();

