import dedent from "dedent";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { isCategoryValid } from "./util/isCategoryValid.mjs";
import { isDateValid } from "./util/isDateValid.mjs";
import { isTagValid } from "./util/isTagValid.mjs";
import { isTitleValid } from "./util/isTitleValid.mjs";
import { negatePromise } from "./util/negatePromise.mjs";
import { toSlug } from "./util/toSlug.mjs";

// ensure no file with {slug}.md exists

Promise.all([import("yargs/yargs"), import("inquirer")]).then(
  async ([yargs, inquirer]) => {
    const argv = yargs
      .default(process.argv)
      .option("title", {
        alias: "n",
        description: "The name of the page",
        type: "string",
      })
      .option("date", {
        alias: "d",
        default: new Date().toISOString(),
        description: "The date of the page, in YYYY-MM-DD format.",
        type: "string",
      })
      .option("category", {
        alias: "c",
        array: true,
        description: "The categories of the page",
        type: "string",
      })
      .option("tag", {
        alias: "t",
        array: true,
        description: "The tags of the page",
        type: "string",
      })
      .parseSync();

    const { category, date, tag, title } = argv;

    const prompts = await inquirer.default.prompt([
      {
        message: "Enter the title of the new page",
        name: "title",
        type: "input",
        validate: isTitleValid,
        when: negatePromise(isTitleValid(title)),
      },
      {
        default: new Date().toISOString(),
        message: "Enter the date for the page (YYYY-MM-DD)",
        name: "date",
        type: "input",
        validate: isDateValid,
        when: negatePromise(isDateValid(date)),
      },
      {
        filter: (input: string) => input.split(",").map((c) => c.trim()),
        message:
          "Enter the categories for the page (--category xxx, --category yyy)",
        name: "category",
        type: "input",
        validate: isCategoryValid,
        when: negatePromise(isCategoryValid(category)),
      },
      {
        filter: (input: string) => input.split(",").map((c) => c.trim()),
        message: "Enter the tags for the page (--tag xxx, --tag yyy)",
        name: "tag",
        type: "input",
        validate: isTagValid,
        when: negatePromise(isTagValid(tag)),
      },
    ]);

    const combined = Object.assign({}, { category, date, tag, title }, prompts);

    console.log({ combined, prompts });

    console.log(YAML.stringify(combined));
    const contents = dedent`---
    ${YAML.stringify(combined).trim()}
    ---`;

    // use the yaml

    const slug = toSlug(combined.title);

    const directoryPath = path.resolve(`projects/connections/src/assets/pages`);
    fs.mkdirSync(directoryPath, { recursive: true });

    const pagePath = path.resolve(directoryPath, `${slug}.md`);

    fs.writeFileSync(pagePath, contents);

    console.log(
      `New page created at ${path.relative(process.cwd(), pagePath)}`,
    );
  },
);
