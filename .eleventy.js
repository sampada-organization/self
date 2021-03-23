module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("src/admin/config.yml");
  return {
    passthroughFileCopy: true,
    mardownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
    dir: {
      input: "src",
      include: "includes",
      output: "_site",
      data: "../_data",
    },
  };
};
