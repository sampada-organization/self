module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("src/admin");

  // Expose dev server on LAN (not only 127.0.0.1)
  eleventyConfig.setBrowserSyncConfig({
    host: "0.0.0.0",
    port: 8080,
    open: false,
    notify: false,
    ui: false,
    ghostMode: false,
  });

  /**
   * Format exact INR numbers for display:
   *  >= 1 crore (1e7) → "13.75" + unit "Cr"
   *  >= 1 lakh (1e5)  → "1.01" + unit "Lakh"
   *  else             → Indian-locale integer, no unit
   * CMS always stores the raw number; this is display-only.
   */
  eleventyConfig.addFilter("inrScale", function (value) {
    const raw = Number(String(value).replace(/,/g, ""));
    if (!Number.isFinite(raw)) {
      return { display: String(value == null ? "" : value), unit: "", exact: String(value == null ? "" : value), raw: 0 };
    }
    const exact = raw.toLocaleString("en-IN");
    function trim(n) {
      var s = n.toFixed(2);
      return s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    }
    if (Math.abs(raw) >= 1e7) {
      return { display: trim(raw / 1e7), unit: "Cr", exact, raw };
    }
    if (Math.abs(raw) >= 1e5) {
      return { display: trim(raw / 1e5), unit: "Lakh", exact, raw };
    }
    return { display: exact, unit: "", exact, raw };
  });

  eleventyConfig.addCollection("managementTeam", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/management-team/*.md")
      .sort(function (a, b) { return (a.data.order || 0) - (b.data.order || 0); });
  });

  eleventyConfig.addCollection("directors", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/directors-list/*.md")
      .sort(function (a, b) { return (a.data.order || 0) - (b.data.order || 0); });
  });

  eleventyConfig.addCollection("resources", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/resources-list/*.md")
      .sort(function (a, b) { return (a.data.order || 0) - (b.data.order || 0); });
  });

  eleventyConfig.addCollection("testimonials", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/testimonials-list/*.md")
      .sort(function (a, b) { return (a.data.order || 0) - (b.data.order || 0); });
  });

  eleventyConfig.addCollection("testimonialsHome", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/testimonials-list/*.md")
      .filter(function (item) { return item.data.showOnHome; })
      .sort(function (a, b) { return (a.data.order || 0) - (b.data.order || 0); });
  });

  return {
    passthroughFileCopy: true,
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
      data: "../_data",
    },
  };
};
