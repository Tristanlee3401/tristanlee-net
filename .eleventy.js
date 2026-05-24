module.exports = function(eleventyConfig) {
  // Tell Eleventy to copy your assets straight through to the output folder
	eleventyConfig.addPassthroughCopy("src/assets");
	eleventyConfig.addPassthroughCopy("src/CNAME");
	eleventyConfig.addPassthroughCopy("src/robots.txt");

  return {
    dir: {
      input: "src",
      output: "_site"
    },
	htmlTemplateEngine: "liquid"
  };
};
