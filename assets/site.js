/*
 * Neart Decorating — site script (plain JavaScript, no framework).
 *
 * - Loads Google Tag Manager (GTM-MFJQ4MFF) with Google Consent Mode.
 *   The consent defaults (everything "denied") are set inline in each page's <head>
 *   before this file runs.
 * - SHOW_COOKIE_BANNER (below) switches the banner off: currently every visitor is
 *   treated as accepted. When it is on:
 * - Shows the cookie banner until the visitor accepts or rejects optional cookies,
 *   and remembers the choice in localStorage ("neart_cookie_choice").
 * - "Cookie settings" in the footer clears the choice and shows the banner again.
 *
 * The quote forms are plain HTML: they post straight to Basin, which redirects to the
 * static thank-you page. No JavaScript is involved in submitting them.
 *
 * - Mobile menu: the burger button opens the main menu. On mobile, the first tap on
 *   "Services" or "Locations" opens its sub-list; a second tap goes to that page.
 */
(() => {
  const nav = document.querySelector(".nav");
  const toggle = nav && nav.querySelector(".nav-toggle");
  if (!toggle) return;
  const isMobile = () => window.matchMedia("(max-width: 850px)").matches;
  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) nav.querySelectorAll(".nav-dropdown.expanded").forEach((d) => d.classList.remove("expanded"));
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.querySelectorAll(".nav-dropdown-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (!isMobile()) return;
      const dropdown = trigger.closest(".nav-dropdown");
      if (!dropdown.classList.contains("expanded")) {
        event.preventDefault();
        nav.querySelectorAll(".nav-dropdown.expanded").forEach((d) => d.classList.remove("expanded"));
        dropdown.classList.add("expanded");
      }
    });
  });
  // Close after choosing a link (needed for same-page links such as /#work).
  nav.querySelectorAll(".navlinks a").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!event.defaultPrevented) setOpen(false);
    });
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setOpen(false); });
  window.addEventListener("resize", () => { if (!isMobile()) setOpen(false); });
})();

(() => {
  const GTM_ID = "GTM-MFJQ4MFF";
  const STORAGE_KEY = "neart_cookie_choice";

  // false = no cookie banner: every visitor is treated as having accepted, GTM always
  //         loads with all consent granted, and the footer "Cookie settings" button is hidden.
  // true  = show the Accept / Reject banner (settings below apply).
  const SHOW_COOKIE_BANNER = false;

  // true  = GTM loads on every visit; Google tags respect Consent Mode, and any other
  //         tag (WhatConverts, Bing UET) should be set in GTM to require ad_storage consent.
  // false = GTM loads only after the visitor clicks "Accept optional" (old behaviour).
  const LOAD_GTM_BEFORE_CONSENT = true;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function readChoice() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === "accepted" || value === "rejected" ? value : null;
    } catch {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage blocked: the choice applies to this page view only */
    }
  }

  function clearChoice() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function grantConsent() {
    gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    window.dataLayer.push({ event: "cookie_consent_accepted" });
  }

  let gtmLoaded = false;
  function loadGtm() {
    if (gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(script);
  }

  // ---- No banner: every visitor treated as accepted --------------------------
  if (!SHOW_COOKIE_BANNER) {
    grantConsent();
    loadGtm();
    const hideCookieSettings = () =>
      document.querySelectorAll(".footer-cookie-button").forEach((button) => button.remove());
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", hideCookieSettings);
    } else {
      hideCookieSettings();
    }
    return;
  }

  // ---- Consent + GTM -------------------------------------------------------
  const choice = readChoice();
  if (choice === "accepted") grantConsent();
  if (LOAD_GTM_BEFORE_CONSENT || choice === "accepted") loadGtm();

  // ---- Cookie banner -------------------------------------------------------
  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;

    const banner = document.createElement("aside");
    banner.className = "cookie-banner";
    banner.setAttribute("aria-label", "Cookie choices");
    banner.innerHTML =
      '<div><strong>Your privacy matters</strong>' +
      "<p>We use optional analytics and advertising cookies to understand visits and improve our marketing. " +
      'You can accept or reject them. <a href="/cookie-policy/">Read our Cookie Policy</a>.</p></div>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="cookie-reject">Reject optional</button>' +
      '<button type="button" class="button button-gold">Accept optional</button>' +
      "</div>";

    banner.querySelector(".cookie-reject").addEventListener("click", () => {
      saveChoice("rejected");
      banner.remove();
    });
    banner.querySelector(".button-gold").addEventListener("click", () => {
      saveChoice("accepted");
      grantConsent();
      loadGtm();
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  function init() {
    if (choice === null) showBanner();

    document.querySelectorAll(".footer-cookie-button").forEach((button) => {
      button.addEventListener("click", () => {
        clearChoice();
        // Reload so tags that already ran under a previous choice stop running.
        window.location.reload();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
