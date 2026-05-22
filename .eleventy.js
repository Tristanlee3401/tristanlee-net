module.exports = function(eleventyConfig) {
  // Tell Eleventy to copy your assets straight through to the output folder
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/styles-2.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  return {
    dir: {
      input: "src",
      output: "_site"
    },
	htmlTemplateEngine: "liquid"
  };
};
