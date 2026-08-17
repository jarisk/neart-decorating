(() => {
  const menuButton = document.querySelector(".mobile-menu-toggle");
  const navigation = document.querySelector("nav.nav");
  const locationDropdown = document.querySelector(".nav-dropdown");
  const locationTrigger = document.querySelector(".nav-dropdown-trigger");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const open = navigation.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-visible", open);
    });
    navigation.querySelectorAll(".navlinks > a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("menu-open");
        document.body.classList.remove("menu-visible");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (locationTrigger && locationDropdown) {
    locationTrigger.addEventListener("click", (event) => {
      if (window.innerWidth <= 850) {
        event.preventDefault();
        event.stopPropagation();
        locationDropdown.classList.toggle("mobile-open");
        locationTrigger.setAttribute("aria-expanded", String(locationDropdown.classList.contains("mobile-open")));
      }
    });
  }

  const key = "neart_cookie_choice";
  const banner = document.querySelector(".cookie-banner");

  function loadGtm() {
    window.dataLayer = window.dataLayer || [];
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-MFJQ4MFF";
    document.head.appendChild(script);
  }

  const saved = localStorage.getItem(key);
  if (saved === "accepted") loadGtm();
  if (banner && saved !== "accepted" && saved !== "rejected") banner.hidden = false;

  document.querySelectorAll("[data-cookie]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.cookie;
      localStorage.setItem(key, choice);
      if (banner) banner.hidden = true;
      if (choice === "accepted") loadGtm();
    });
  });

  document.querySelectorAll(".footer-cookie-button").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(key);
      if (banner) banner.hidden = false;
    });
  });

  document.querySelectorAll('form[action^="https://usebasin.com/"]').forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      const original = submit.textContent;
      submit.disabled = true;
      submit.textContent = "Sending…";
      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!response.ok) throw new Error();
        window.location.href = "/thank-you/";
      } catch {
        submit.disabled = false;
        submit.textContent = original;
        alert("Sorry, something went wrong. Please call 029 2168 0320.");
      }
    });
  });
})();
