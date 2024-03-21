import dedent from "dedent";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { isCategoryValid } from "./isCategoryValid.mjs";
import { isDateValid } from "./isDateValid.mjs";
import { isTagValid } from "./isTagValid.mjs";
import { isTitleValid } from "./isTitleValid.mjs";
import { negatePromise } from "./negatePromise.mjs";
import { toSlug } from "./toSlug.mjs";

async function run(yargs: any, inquirer: any) {
  let argv = yargs(process.argv)
    .option("title", {
      alias: "n",
      type: "string",
      description: "The name of the post",
    })
    .option("date", {
      alias: "d",
      type: "string",
      description: "The date of the post, in YYYY-MM-DD format.",
      default: new Date().toISOString(),
    })
    .option("category", {
      alias: "c",
      type: "string",
      description: "The categories of the post",
      array: true,
    })
    .option("tag", {
      alias: "t",
      type: "string",
      description: "The tags of the post",
      array: true,
    })
    .parseSync();

  const { title, date, category, tag } = argv;

  const prompts = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "Enter the title of the new page",
      validate: isTitleValid,
      when: negatePromise(isTitleValid(title)),
    },
    {
      type: "input",
      name: "date",
      message: "Enter the date for the page (YYYY-MM-DDT00:00:00.000Z)",
      validate: isDateValid,
      when: negatePromise(isDateValid(date)),
      default: new Date().toISOString(),
    },
    {
      type: "input",
      name: "category",
      message:
        "Enter the categories for the page (--category xxx, --category yyy)",
      filter: (input: string) => input.split(",").map((c) => c.trim()),
      validate: isCategoryValid,
      when: negatePromise(isCategoryValid(category)),
    },
    {
      type: "input",
      name: "tag",
      message: "Enter the tags for the page (--tag xxx, --tag yyy)",
      filter: (input: string) => input.split(",").map((c) => c.trim()),
      validate: isTagValid,
      when: negatePromise(isTagValid(tag)),
    },
  ]);

  const combined = Object.assign({}, { title, date, category, tag }, prompts);

  const built: Record<string, any> = {
    title: combined.title,
    date: combined.date,
  };
  if (combined.category) {
    built["categories"] = combined.category;
  }
  if (combined.tag) {
    built.tags = combined.tag;
  }

  const contents = dedent`---
  ${YAML.stringify(built).trim()}
  ---`;

  // use the yaml
  const year = combined.date.split("-")[0];
  const month = combined.date.split("-")[1];
  const day = combined.date.split("-")[2].split("T")[0];

  // write the yaml to /projects/connections/src/assets/posts/{year}/{month}/{day}/{slug}.md
  // ensure the directories exist, recursively
  const resolved = path.resolve(
    `projects/connections/src/assets/posts/${year}/${month}/${day}`,
  );
  fs.mkdirSync(resolved, { recursive: true });

  // ensure no file with {slug}.md exists
  const slug = toSlug(combined.title);
  const filename = `${slug}.md`;
  const filepath = `${resolved}/${filename}`;
  // write the file

  fs.writeFileSync(filepath, contents, { encoding: "utf-8" });

  console.log(`Wrote ${path.relative(process.cwd(), filepath)}.`);

  // append to the index.md file
  const resolvedIndexPath = path.resolve(
    `projects/connections/src/assets/posts/index.md`,
  );
  const indexContents = fs.readFileSync(resolvedIndexPath, {
    encoding: "utf-8",
  });
  const indexContentsLines = indexContents.trimEnd().split("\n");
  indexContentsLines.push(
    `1. [${combined.title}](${year}/${month}/${day}/${slug})`,
    "",
  );

  fs.writeFileSync(resolvedIndexPath, indexContentsLines.join("\n"), {
    encoding: "utf-8",
  });
  console.log(`Updated ${path.relative(process.cwd(), resolvedIndexPath)}.`);
}
// ensure no file with {slug}.md exists

Promise.all([import("yargs/yargs"), import("inquirer"), import("yaml")]).then(
  ([yargs, inquirer]) => run(yargs.default, inquirer.default),
);
