export enum Heatmap {
	Averages,
	Totals,
	Series,
}

export enum HeatmapScheme {
	None,
	BlackWhite,
	GreenYellowRed,
	WhiteRed,
	WhiteBlue,
	WhitePurple,
	WhiteYellow,
	GreenWhiteRed,
	BlueWhiteYellow,
	BlueWhiteRed,
	GreenWhitePurple,
}

const white = '#ffffff';
const black = '#000000';
const green = '#63be7a';
const yellow = '#fedc80';
const red = '#f8696b';
const blue = '#025196';
const purple = '#6a0572';
export const heatmapSchemePalettes = {
	[HeatmapScheme.BlackWhite]: [black, white],
	[HeatmapScheme.BlueWhiteRed]: [blue, white, red],
	[HeatmapScheme.BlueWhiteYellow]: [blue, white, yellow],
	[HeatmapScheme.GreenWhiteRed]: [green, white, red],
	[HeatmapScheme.GreenYellowRed]: [green, yellow, red],
	[HeatmapScheme.None]: [white],
	[HeatmapScheme.GreenWhitePurple]: [green, white, purple],
	[HeatmapScheme.WhiteBlue]: [white, blue],
	[HeatmapScheme.WhitePurple]: [white, purple],
	[HeatmapScheme.WhiteRed]: [white, red],
	[HeatmapScheme.WhiteYellow]: [white, yellow],
};
export const heatmapSchemeLabels = {
	[HeatmapScheme.BlackWhite]: 'Black/White',
	[HeatmapScheme.BlueWhiteRed]: 'Blue/White/Red',
	[HeatmapScheme.BlueWhiteYellow]: 'Blue/White/Yellow',
	[HeatmapScheme.GreenWhiteRed]: 'Green/White/Red',
	[HeatmapScheme.GreenYellowRed]: 'Green/Yellow/Red',
	[HeatmapScheme.None]: 'None',
	[HeatmapScheme.GreenWhitePurple]: 'Green/White/Purple',
	[HeatmapScheme.WhiteBlue]: 'White/Blue',
	[HeatmapScheme.WhitePurple]: 'White/Purple',
	[HeatmapScheme.WhiteRed]: 'White/Red',
	[HeatmapScheme.WhiteYellow]: 'White/Yellow',
};
export const heatmapsLabels = {
	[Heatmap.Averages]: 'Averages',
	[Heatmap.Totals]: 'Totals',
	[Heatmap.Series]: 'Extra Series',
};
