const path = require('node:path');

const eslint = require('@eslint/js');
const angular = require('angular-eslint');
const perfectionist = require('eslint-plugin-perfectionist');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
	// only add "root-level" configs here if the config can apply to all files.
	eslint.configs.recommended,
	{
		extends: [perfectionist.configs['recommended-natural']],
		rules: {
			'perfectionist/sort-imports': [
				'error',
				{
					/**
					 * These groups will match in the order they are defined.
					 * `perfectionist` itself does not allow the groups to be in any
					 * arbitrary order, but will leave arrays of entries as-is.
					 *
					 * By using entries => object, these can be in an arbitrary order.
					 */
					customGroups: {
						type: Object.fromEntries([
							['app-type', ['^@app/.+$']],
							['material-type', ['^@angular/material.*$']],
							['angular-type', ['^@angular/.+$']],
						]),
						value: Object.fromEntries([
							['rxjs', ['^rxjs$']],
							['tod', ['^@tod/']],

							// material needs to match first
							['material', ['^@angular/material.*$']],
							['angular', ['^@angular/.+$']],

							// order of matching is important.
							['app-component', ['^@app/.+/.+\\.component$']],
							['app-service', ['^@app/.+/.+\\.service$']],
							['app-form', ['^@app/.+/.+\\.form$']],
							['app', ['^@app/.+$']],

							['component', ['components/.+/.+\\.component$']],
							['service', ['services/.+/.+\\.service$']],
							['form', ['forms/.+/.+\\.form$']],
						]),
					},
					groups: [
						'type',
						'angular-type',
						'material-type',
						'external-type',
						'internal-type',
						'app-type',
						['parent-type', 'sibling-type', 'index-type'],

						'builtin',
						'angular',
						'material',
						'rxjs',
						'external',
						'tod',
						'internal',
						'app',
						'app-service',
						'app-component',
						'app-form',
						'service',
						'component',
						'form',
						['parent', 'sibling', 'index'],
						'object',
						'unknown',
					],
					internalPattern: ['^@(app)/.+$'],
					type: 'natural',
				},
			],
		},
	},
	// ignores go first
	{
		ignores: ['**/model/**/*.ts', '**/*.d.ts'],
	},

	// Set up tseslint parser but DO NOT configure rules yet.
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: path.join(__dirname, 'tsconfig.json'),
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
		// if you need any file processors, do them with the parser config object
		// processor: ngeslint.processInlineTemplates,
	},
	{
		files: ['**/*.html'],
		languageOptions: {
			parser: angular.templateParser,
		},
	},

	// these rules only work with Type information, and should only be run
	// on typescript files
	{
		// move the recommended configs into an extends array
		// so that eslint doesn't try to use the configs on non-TS files.
		extends: [
			tseslint.configs.recommendedTypeChecked,
			// tseslint.configs.stylisticTypeChecked,
			angular.configs.tsRecommended,
		],
		files: ['**/*.ts'],
		// plugins: {},

		// plugins: { tseslint: tseslint }, // long-hand object initializer
		// plugins: { tseslint },           // short-hand object initializer
		//   -> alias will be 'tseslint'
		//   `alias/rule` => 'tseslint/consistent-type-imports'

		rules: {
			// the '@typescript-eslint/` prefix alias is determined by the key used
			// for the plugin in the `plugins` object.
			'@typescript-eslint/consistent-type-imports': 'error',
		},
	},

	// these rules work for JS and TS, so separating parser/rules config
	// cuts down on duplication and makes it easier to share configs.
	{
		rules: {
			curly: ['error', 'all'],
			'no-console': process.env.CI ? 'error' : 'warn',
			'no-debugger': process.env.CI ? 'error' : 'warn',
			'no-undef': ['off'],
		},
	},
);
