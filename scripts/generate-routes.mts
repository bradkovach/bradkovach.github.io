// get all the *.md files in /projects/connections/src/assets/posts/**/*.ts

import { globSync } from "glob";
import path from "path";

const assets = path.join(process.cwd(), "projects/connections/src/assets");
const postsDir = path.join(assets, "posts");
const pagesDir = path.join(assets, "pages");

const posts = globSync(path.join(postsDir, "**/*.md"));

// get all the *.md files in /projects/connections/src/app/pages/**/*.md

const pages = globSync(path.join(pagesDir, "**/*.md"));

const routes = new Set<string>([
  ...posts.map(
    (post) => "/blog/" + path.relative(postsDir, post).replace(/.md$/, ""),
  ),

  ...pages.map(
    (page) => "/" + path.relative(pagesDir, page).replace(/.md$/, ""),
  ),
]);

routes.delete("/index");

console.log([...routes]);

// write to routes.txt
import fs from "node:fs";
fs.writeFileSync("routes.txt", [...routes].join("\n") + "\n");

console.log(`Wrote ${routes.size} routes to routes.txt`);
