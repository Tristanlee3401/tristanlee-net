const { dateToRfc822 } = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
  eleventyConfig.addLiquidFilter("dateToRfc822", dateToRfc822);

  eleventyConfig.addLiquidFilter("htmlToAbsoluteUrls", (content, base) => content);

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addCollection("diary", function(collectionApi) {
    return collectionApi.getFilteredByTag("diary")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      output: "_site"
    },
    htmlTemplateEngine: "liquid"
  };
};
