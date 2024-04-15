export enum Footnote {
	HighestAverageRate,
	LowestAverageRate,
	SpecialRate,
	Automated,
	FixedPerMonth,
	NoConfirmationCode,
}

export const footnoteSymbols: Record<Footnote, string> = {
	// dagger
	[Footnote.HighestAverageRate]: '†',
	// asterisk
	[Footnote.LowestAverageRate]: '*',
	// section symbol
	[Footnote.SpecialRate]: '§',
	// double dagger
	[Footnote.Automated]: '‡',
	// pilcrow
	[Footnote.FixedPerMonth]: '¶',
	// hash
	[Footnote.NoConfirmationCode]: '#',
};

export const footnoteExplanations: Record<Footnote, string> = {
	[Footnote.HighestAverageRate]:
		'This is the highest average calculated bill total, based on your therm usage.',
	[Footnote.LowestAverageRate]:
		'This is the lowest average calculated bill total, based on your therm usage.',
	[Footnote.SpecialRate]:
		'This is a special rate offer, and may not be available to all customers.',
	[Footnote.Automated]: 'Data from this supplier is automatically updated.',
	[Footnote.FixedPerMonth]:
		'This rate is a fixed price per month, and the rate is offered per-household. To see the rate that you would pay, contact the supplier and click Edit Rate to add your rate data to the Price Explorer.',
	[Footnote.NoConfirmationCode]:
		'This supplier has not published a Confirmation Code for this rate. To choose this rate, please contact the supplier directly. ',
};