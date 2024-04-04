import dedent from 'dedent';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { isCategoryValid } from './isCategoryValid';
import { isDateValid } from './isDateValid';
import { isTagValid } from './isTagValid';
import { isTitleValid } from './isTitleValid';
import { negatePromise } from './negatePromise';
import { toSlug } from './toSlug';

async function run(yargs: any, inquirer: any) {
  let argv = yargs(process.argv)
    .option('title', {
      alias: 'n',
      type: 'string',
      description: 'The name of the page',
    })
    .option('date', {
      alias: 'd',
      type: 'string',
      description: 'The date of the page, in YYYY-MM-DD format.',
      default: new Date().toISOString(),
    })
    .option('category', {
      alias: 'c',
      type: 'string',
      description: 'The categories of the page',
      array: true,
    })
    .option('tag', {
      alias: 't',
      type: 'string',
      description: 'The tags of the page',
      array: true,
    })
    .parseSync();

  const { title, date, category, tag } = argv;

  const prompts = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the title of the new page',
      validate: isTitleValid,
      when: negatePromise(isTitleValid(title)),
    },
    {
      type: 'input',
      name: 'date',
      message: 'Enter the date for the page (YYYY-MM-DD)',
      validate: isDateValid,
      when: negatePromise(isDateValid(date)),
      default: new Date().toISOString(),
    },
    {
      type: 'input',
      name: 'category',
      message:
        'Enter the categories for the page (--category xxx, --category yyy)',
      filter: (input: string) => input.split(',').map((c) => c.trim()),
      validate: isCategoryValid,
      when: negatePromise(isCategoryValid(category)),
    },
    {
      type: 'input',
      name: 'tag',
      message: 'Enter the tags for the page (--tag xxx, --tag yyy)',
      filter: (input: string) => input.split(',').map((c) => c.trim()),
      validate: isTagValid,
      when: negatePromise(isTagValid(tag)),
    },
  ]);

  const combined = Object.assign({}, { title, date, category, tag }, prompts);

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

  console.log(`New page created at ${path.relative(process.cwd(), pagePath)}`);
}
// ensure no file with {slug}.md exists

Promise.all([import('yargs/yargs'), import('inquirer'), import('yaml')]).then(
  ([yargs, inquirer]) => run(yargs.default, inquirer.default),
);
