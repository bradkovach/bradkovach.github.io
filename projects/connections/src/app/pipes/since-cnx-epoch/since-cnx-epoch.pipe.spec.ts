import { EpochToDatePipe } from './since-cnx-epoch.pipe';

describe('SinceCnxEpochPipe', () => {
  it('create an instance', () => {
    const pipe = new EpochToDatePipe();
    expect(pipe).toBeTruthy();
  });
});
