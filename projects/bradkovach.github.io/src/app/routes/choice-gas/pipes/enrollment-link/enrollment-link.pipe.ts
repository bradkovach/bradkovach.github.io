import { Pipe, PipeTransform } from '@angular/core';
import { EnrollmentField } from '../../services/data/data.service';

@Pipe({
	name: 'enrollmentLink',
	standalone: true,
})
export class EnrollmentLinkPipe implements PipeTransform {
	transform(
		enrollmentFields: Record<EnrollmentField, string>,
		confirmationCode: string,
	): string {
		const url = new URL('https://www.blackhillsenergy.com/app-choicegas/');
		url.searchParams.set(
			'accountNumber',
			enrollmentFields[EnrollmentField.AccountNumber],
		);
		url.searchParams.set(
			'controlNumber',
			enrollmentFields[EnrollmentField.ControlNumber],
		);
		url.searchParams.set('confirmationCode', confirmationCode);
		return url.toString();
	}
}
