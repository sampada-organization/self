/**
 * SELF site i18n: English / Hindi / Marathi
 * - UI strings from /assets/i18n/ui.json
 * - Optional CMS overrides: data-i18n-hi / data-i18n-mr
 * - Auto-translate remaining page copy via free MyMemory API (cached in localStorage)
 */
(function () {
  "use strict";

  var STORAGE_KEY = "self_lang";
  var CACHE_KEY = "self_i18n_cache_v1";
  var SUPPORTED = ["en", "hi", "mr"];
  var ui = null;
  var current = "en";
  var cache = {};
  var translating = false;

  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {};
  } catch (e) {
    cache = {};
  }

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  function getLang() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q && SUPPORTED.indexOf(q) !== -1) return q;
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s && SUPPORTED.indexOf(s) !== -1) return s;
    } catch (e) {}
    return "en";
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    current = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    document.documentElement.lang = lang === "mr" ? "mr" : lang === "hi" ? "hi" : "en";
    document.documentElement.setAttribute("data-lang", lang);
    updateSwitcherUI();
    applyUI();
    applyCmsOverrides();
    applyI18nImages();
    autoTranslateContent();
  }

  function t(key) {
    if (!ui) return key;
    var pack = ui[current] || ui.en || {};
    return pack[key] != null ? pack[key] : (ui.en && ui.en[key]) || key;
  }

  function applyUI() {
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      if (!key) continue;
      var val = t(key);
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        el.setAttribute(attr, val);
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", val);
      } else {
        el.textContent = val;
      }
    }
    var titleEl = document.querySelector("title");
    if (titleEl && ui && ui[current] && ui[current].site_title) {
      titleEl.textContent = ui[current].site_title;
    }
  }

  /** Prefer editor-provided hi/mr text from sibling <template class="i18n-override"> */
  function applyCmsOverrides() {
    var withSrc = document.querySelectorAll("[data-i18n-src]");
    for (var r = 0; r < withSrc.length; r++) {
      withSrc[r].innerHTML = withSrc[r].getAttribute("data-i18n-src");
      withSrc[r].setAttribute("data-i18n-has-override", "0");
    }

    var templates = document.querySelectorAll(
      "template.i18n-override[data-lang='" + current + "']"
    );
    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      var target = tpl.previousElementSibling;
      if (!target) continue;
      if (!target.getAttribute("data-i18n-src")) {
        target.setAttribute("data-i18n-src", target.innerHTML);
      }
      target.innerHTML = tpl.innerHTML;
      target.setAttribute("data-i18n-has-override", "1");
    }
  }

  function applyI18nImages() {
    var imgs = document.querySelectorAll("[data-i18n-img]");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var base = img.getAttribute("data-i18n-img");
      if (!base) continue;
      if (!img.getAttribute("data-i18n-img-default")) {
        img.setAttribute("data-i18n-img-default", img.getAttribute("src") || "");
      }
      // base like "micro-credit" → /assets/img/i18n/micro-credit-en.webp
      var src = "/assets/img/i18n/" + base + "-" + current + ".svg";
      img.setAttribute("src", src);
      img.onerror = (function (el) {
        return function () {
          var fallback = el.getAttribute("data-i18n-img-default");
          if (fallback) el.setAttribute("src", fallback);
        };
      })(img);
    }
  }

  function hashText(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  }

  function myMemoryTranslate(text, from, to) {
    if (!text || !text.trim()) return Promise.resolve(text);
    if (from === to) return Promise.resolve(text);
    var key = from + "|" + to + "|" + hashText(text);
    if (cache[key]) return Promise.resolve(cache[key]);

    // Free MyMemory API (no key required for light use)
    var url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text.slice(0, 450)) +
      "&langpair=" +
      encodeURIComponent(from + "|" + to);

    return fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var out =
          data &&
          data.responseData &&
          data.responseData.translatedText
            ? data.responseData.translatedText
            : text;
        // MyMemory sometimes returns QUOTA EXCEEDED as translation
        if (/QUOTA EXCEEDED|INVALID SOURCE/i.test(out)) out = text;
        cache[key] = out;
        saveCache();
        return out;
      })
      .catch(function () {
        return text;
      });
  }

  function collectAutoNodes() {
    return document.querySelectorAll(
      "[data-i18n-auto], .testimonial-quote-card__text, .testimonial-full-card__text, .people-card__bio, .resource-card__desc, .single-service-item p, .single-service-item h5, .section-title h6, .section-title h2, .stats-card__label, .page-header-toast__title, .self-engine h2, .hero-area-content .section-title h1, .hero-area-content .section-title h5"
    );
  }

  function autoTranslateContent() {
    if (current === "en") {
      // restore originals
      var nodes = collectAutoNodes();
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.hasAttribute("data-i18n")) continue; // UI keys already handled
        if (el.getAttribute("data-i18n-hi") || el.getAttribute("data-i18n-mr")) {
          // cms override path
          if (el.getAttribute("data-i18n-src")) el.innerHTML = el.getAttribute("data-i18n-src");
          continue;
        }
        if (el.getAttribute("data-i18n-src")) {
          el.innerHTML = el.getAttribute("data-i18n-src");
        }
      }
      setStatus("");
      return;
    }

    // CMS override first
    applyCmsOverrides();

    var list = [];
    var nodes2 = collectAutoNodes();
    for (var j = 0; j < nodes2.length; j++) {
      var node = nodes2[j];
      if (node.hasAttribute("data-i18n")) continue;
      // skip if CMS language override was applied
      if (node.getAttribute("data-i18n-has-override") === "1") continue;

      if (!node.getAttribute("data-i18n-src")) {
        node.setAttribute("data-i18n-src", node.innerHTML);
      }
      var srcHtml = node.getAttribute("data-i18n-src");
      var plain = srcHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (plain.length < 2) continue;
      list.push({ node: node, plain: plain, srcHtml: srcHtml });
    }

    if (!list.length) return;

    setStatus(t("translating"));
    translating = true;

    // sequential batches to respect free API limits
    var idx = 0;
    function next() {
      if (idx >= list.length) {
        translating = false;
        setStatus("");
        return;
      }
      var item = list[idx++];
      // detect if source looks non-english → still use en as stored source from page
      myMemoryTranslate(item.plain, "en", current).then(function (translated) {
        // keep simple: replace text content if single paragraph-ish
        if (item.node.children.length === 0 || item.node.children.length === 1) {
          if (item.node.children.length === 1 && item.node.children[0].tagName === "P") {
            item.node.children[0].textContent = translated;
          } else if (item.node.children.length === 0) {
            item.node.textContent = translated;
          } else {
            item.node.innerHTML = "<p>" + escapeHtml(translated) + "</p>";
          }
        } else {
          item.node.innerHTML = "<p>" + escapeHtml(translated) + "</p>";
        }
        // small delay between free API calls
        setTimeout(next, 180);
      });
    }
    next();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(msg) {
    var el = document.getElementById("lang-switcher-status");
    if (el) el.textContent = msg || "";
  }

  function updateSwitcherUI() {
    var root = document.getElementById("lang-switcher");
    if (!root) return;
    var buttons = root.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var lang = b.getAttribute("data-set-lang");
      if (lang === current) b.classList.add("is-active");
      else b.classList.remove("is-active");
    }
    var label = root.querySelector(".lang-switcher__current-label");
    if (label && ui && ui[current]) label.textContent = ui[current].lang_name;
  }

  function bindSwitcher() {
    var root = document.getElementById("lang-switcher");
    if (!root) return;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-set-lang]");
      if (!btn) return;
      e.preventDefault();
      setLang(btn.getAttribute("data-set-lang"));
      root.classList.remove("is-open");
    });
    var toggle = root.querySelector(".lang-switcher__fab");
    if (toggle) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        root.classList.toggle("is-open");
      });
    }
    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) root.classList.remove("is-open");
    });
  }

  function injectSwitcher() {
    if (document.getElementById("lang-switcher")) return;
    var wrap = document.createElement("div");
    wrap.id = "lang-switcher";
    wrap.className = "lang-switcher";
    wrap.setAttribute("aria-label", "Language");
    wrap.innerHTML =
      '<button type="button" class="lang-switcher__fab" aria-expanded="false" aria-haspopup="true">' +
      '<span class="lang-switcher__fab-icon" aria-hidden="true">文A</span>' +
      '<span class="lang-switcher__current-label">English</span>' +
      "</button>" +
      '<div class="lang-switcher__panel" role="menu">' +
      '<p class="lang-switcher__hint" data-i18n="choose_language">Language</p>' +
      '<button type="button" class="lang-switcher__opt" data-set-lang="en" role="menuitem">' +
      '<span class="lang-switcher__code">EN</span><span class="lang-switcher__name">English</span></button>' +
      '<button type="button" class="lang-switcher__opt" data-set-lang="hi" role="menuitem">' +
      '<span class="lang-switcher__code">हिं</span><span class="lang-switcher__name">हिन्दी</span></button>' +
      '<button type="button" class="lang-switcher__opt" data-set-lang="mr" role="menuitem">' +
      '<span class="lang-switcher__code">मर</span><span class="lang-switcher__name">मराठी</span></button>' +
      '<p id="lang-switcher-status" class="lang-switcher__status" aria-live="polite"></p>' +
      "</div>";
    document.body.appendChild(wrap);
  }

  function init(dict) {
    ui = dict;
    injectSwitcher();
    bindSwitcher();
    setLang(getLang());
  }

  // Expose for debugging / CMS preview
  window.SELF_I18N = {
    setLang: setLang,
    getLang: function () {
      return current;
    },
    t: t,
    translateText: function (text, to) {
      return myMemoryTranslate(text, "en", to || current);
    },
  };

  fetch("/assets/i18n/ui.json")
    .then(function (r) {
      return r.json();
    })
    .then(init)
    .catch(function () {
      // minimal fallback
      init({
        en: { lang_name: "English", choose_language: "Language", translating: "Translating…" },
        hi: { lang_name: "हिन्दी", choose_language: "भाषा", translating: "अनुवाद…" },
        mr: { lang_name: "मराठी", choose_language: "भाषा", translating: "भाषांतर…" },
      });
    });
})();
