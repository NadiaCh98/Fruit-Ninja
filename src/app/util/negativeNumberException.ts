export class NegativeNumberException extends Error {
  constructor() {
    super('Value can not be negative');
  }
}
