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
