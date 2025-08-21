import { tokenList } from './token-list';

describe('tokenList', () => {
  it('should not repeat the token ID', () => {
    const tokenids = tokenList.map((token) => token.id);
    expect(new Set(tokenids).size).toEqual(tokenids.length);
  });

  it('should have the decimals not null if the address for the network is set', () => {
    tokenList.forEach((token) => {
      Object.keys(token.decimals).forEach((network) => {
        if (token.addresses[network]) {
          const isNull = token.decimals[network] === null;
          if (isNull) console.log(`${token.name} ${network} is null`);

          expect(token.decimals[network]).not.toBeNull();
        }
      });
    });
  });
});
