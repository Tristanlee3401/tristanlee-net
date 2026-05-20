module.exports = function(eleventyConfig) {
  // Tell Eleventy to copy your CSS and JS straight through to the output folder
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");

  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
