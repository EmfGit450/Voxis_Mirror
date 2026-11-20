import * as esbuild from "esbuild";

const options = {
  entryPoints: ["./ts/main.ts"],

  bundle: true,

  platform: "browser",
  format: "esm",
  outfile: "./dist/main.js",

  sourcemap: true,
  treeShaking: true,
  minify: true,
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("Build finished, watching for changes...");
} else {
  await esbuild.build(options);
  console.log("Build finished");
}