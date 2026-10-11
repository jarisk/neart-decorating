/*
 * Neart Decorating — site script (plain JavaScript, no framework).
 *
 * - Loads Google Tag Manager (GTM-MFJQ4MFF) with Google Consent Mode.
 *   The consent defaults (everything "denied") are set inline in each page's <head>
 *   before this file runs.
 * - Shows the cookie banner until the visitor accepts or rejects optional cookies,
 *   and remembers the choice in localStorage ("neart_cookie_choice").
 * - "Cookie settings" in the footer clears the choice and shows the banner again.
 * - Sends the quote forms to Basin in the background and goes to /thank-you.html on success.
 */
(() => {
  const GTM_ID = "GTM-MFJQ4MFF";
  const STORAGE_KEY = "neart_cookie_choice";

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

    // ---- Quote forms (Basin) ----------------------------------------------
    document.querySelectorAll('form[action^="https://usebasin.com/"]').forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        const original = submit ? submit.textContent : "";
        if (submit) {
          submit.disabled = true;
          submit.textContent = "Sending…";
        }
        try {
          const response = await fetch(form.action, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
          });
          if (!response.ok) throw new Error("Basin returned " + response.status);
          window.location.href = "/thank-you.html";
        } catch {
          // Fall back to a normal form post so the enquiry is never lost.
          if (submit) {
            submit.disabled = false;
            submit.textContent = original;
          }
          HTMLFormElement.prototype.submit.call(form);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
