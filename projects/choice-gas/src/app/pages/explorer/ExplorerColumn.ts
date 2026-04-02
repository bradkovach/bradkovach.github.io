export enum ExplorerColumn {
	Name,
	CommmodityCharge,
	Term,
	ConfirmationCode,
	Average,
	Month,
}
export const explorerColumnLabels: Record<ExplorerColumn, string> = {
	[ExplorerColumn.Average]: 'Average',
	[ExplorerColumn.CommmodityCharge]: 'Comm. Chg',
	[ExplorerColumn.ConfirmationCode]: 'Conf. Code',
	[ExplorerColumn.Month]: 'Monthly',
	[ExplorerColumn.Name]: 'Name',
	[ExplorerColumn.Term]: 'Term',
};
