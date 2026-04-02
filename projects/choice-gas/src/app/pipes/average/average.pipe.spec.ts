import { AveragePipe } from './average.pipe';

describe('AveragePipe', () => {
	it('should be defined', () => {
		expect(AveragePipe).toBeDefined();
	});

	it('should calculate the average of an array of numbers', () => {
		const pipe = new AveragePipe();
		const numbers = [1, 2, 3, 4, 5];
		const result = pipe.transform(numbers);
		expect(result).toBe(3);
	});

	it('should return NaN for an empty array', () => {
		const pipe = new AveragePipe();
		const numbers: number[] = [];
		const result = pipe.transform(numbers);
		expect(result).toBeNaN();
	});
});
