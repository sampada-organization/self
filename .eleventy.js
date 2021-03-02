module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  return {
    passthroughFileCopy: true,
    mardownTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"],
    dir: {
      input: "src",
      include: "includes",
      output: "_site",
    },
  };
};
