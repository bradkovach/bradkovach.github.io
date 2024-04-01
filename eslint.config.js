// @ts-check

import perfectionist from 'eslint-plugin-perfectionist';
// @ts-ignore

export default [
	{
		// ignore node_modules
		ignores: ['node_modules/**/*', 'dist/**/*', '.angular/**/*'],
	},
	// recommendedNatural,
	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: { perfectionist },
		languageOptions: {
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'perfectionist/sort-classes': [
				'error',
				{
					type: 'natural',
					order: 'asc',
					groups: [
						'index-signature',
						'static-property',
						'private-property',
						'property',
						'constructor',
						'static-method',
						'private-method',
						'method',
					],
				},
			],
			'perfectionist/sort-objects': [
				'error',
				{ type: 'natural', order: 'asc' },
			],
		},
	},
];
