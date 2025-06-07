import '../extensions/string.extension';

it('should return true if both passed strings are equal ignoring case', () => {
  expect('abc'.lowercasedEquals('ABC')).toBe(true);
});
