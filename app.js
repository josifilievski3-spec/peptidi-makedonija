/* ПептидиМК — интеракции (без надворешни библиотеки) */
(function () {
  "use strict";

  /* ---------- 1. Стики хедер ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. Мобилно мени ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!menu.classList.contains("is-open")) return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  /* ---------- 3. Анимација при скрол ---------- */
  var revealables = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealables.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 4. Активен линк во навигација ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-menu a[href^='#']"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (link) {
      linkFor[link.getAttribute("href").slice(1)] = link;
    });

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkFor[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- 5. Филтер на каталогот ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var peptides = Array.prototype.slice.call(document.querySelectorAll("#peptide-grid .pep"));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");

      chips.forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
      });

      peptides.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-cat") === filter;
        item.classList.toggle("is-hidden", !match);
        if (match) item.classList.add("is-visible");
      });
    });
  });

  /* ---------- 6. Контактна форма (статична, без сервер) ---------- */
  var form = document.getElementById("contact-form");
  var msg = document.getElementById("form-msg");
  var CONTACT_EMAIL = "josifilievski3@gmail.com";

  var IS_EN = (document.documentElement.getAttribute("lang") || "mk").indexOf("en") === 0;
  var T = IS_EN
    ? {
        required: "Fill in all fields before continuing.",
        email: "Check the email address.",
        consent: "Please confirm that you understand this page is educational.",
        subject: "Question from the peptides site — ",
        from: "From"
      }
    : {
        required: "Пополни ги сите полиња пред да продолжиш.",
        email: "Провери ја адресата за е-пошта.",
        consent: "Потврди дека разбираш дека страницата е едукативна.",
        subject: "Прашање од peptidi.mk — ",
        from: "Од"
      };

  function setMessage(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.classList.toggle("is-error", Boolean(isError));
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var consent = form.elements.consent.checked;

      if (!name || !email || !message) {
        setMessage(T.required, true);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setMessage(T.email, true);
        return;
      }
      if (!consent) {
        setMessage(T.consent, true);
        return;
      }

      var subject = T.subject + name;
      var body = message + "\n\n—\n" + T.from + ": " + name + "\nEmail: " + email;
      var href =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = href;
      setMessage(
        IS_EN
          ? "Opening your email client. If nothing opens, write directly to " + CONTACT_EMAIL + "."
          : "Отворам клиент за е-пошта. Ако не се отвори, пиши директно на " + CONTACT_EMAIL + ".",
        false
      );
      form.reset();
    });
  }

  /* ---------- 7. Година во подножје ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
