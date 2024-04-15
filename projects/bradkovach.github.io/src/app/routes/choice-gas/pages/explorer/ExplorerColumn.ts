export enum ExplorerColumn {
	Name,
	CommmodityCharge,
	Term,
	ConfirmationCode,
	Average,
	Month,
}
export const explorerColumnLabels: Record<ExplorerColumn, string> = {
	[ExplorerColumn.Name]: 'Name',
	[ExplorerColumn.CommmodityCharge]: 'Comm. Chg',
	[ExplorerColumn.Term]: 'Term',
	[ExplorerColumn.ConfirmationCode]: 'Conf. Code',
	[ExplorerColumn.Average]: 'Average',
	[ExplorerColumn.Month]: 'Monthly',
};
