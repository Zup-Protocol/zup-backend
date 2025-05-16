import { Networks } from './enums/networks';
import { tokenList } from './token-list';

describe('tokenList', () => {
  it('should match the token list', () => {
    const expectedList = [
      {
        id: '1',
        name: 'Ethereum',
        symbol: 'ETH',
        addresses: {
          [Networks.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          [Networks.SCROLL]: '0x5300000000000000000000000000000000000004',
          [Networks.SEPOLIA]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        },
        decimals: 18,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
      },
      {
        id: '2',
        name: 'Wrapped Ethereum',
        symbol: 'WETH',
        addresses: {
          [Networks.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          [Networks.SCROLL]: '0x5300000000000000000000000000000000000004',
          [Networks.SEPOLIA]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
        },
        decimals: 18,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
      },
      {
        id: '3',
        name: 'Tether',
        symbol: 'USDT',
        addresses: {
          [Networks.ETHEREUM]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          [Networks.SCROLL]: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
          [Networks.SEPOLIA]: null,
        },
        decimals: 6,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
      },
      {
        id: '4',
        name: 'USDC',
        symbol: 'USDC',
        addresses: {
          [Networks.ETHEREUM]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          [Networks.SCROLL]: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
          [Networks.SEPOLIA]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        },
        decimals: 6,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
      },
      {
        id: '5',
        name: 'Wrapped Bitcoin',
        symbol: 'WBTC',
        addresses: {
          [Networks.ETHEREUM]: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          [Networks.SCROLL]: '0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1',
          [Networks.SEPOLIA]: null,
        },
        decimals: 8,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
      },
      {
        id: '6',
        name: 'Coinbase Wrapped Bitcoin',
        symbol: 'cbBTC',
        addresses: {
          [Networks.ETHEREUM]: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          [Networks.SCROLL]: null,
          [Networks.SEPOLIA]: null,
        },
        decimals: 8,
        logoUrl:
          'https://s2.coinmarketcap.com/static/img/coins/200x200/32994.png',
      },
      {
        id: '7',
        name: 'DAI',
        symbol: 'DAI',
        addresses: {
          [Networks.ETHEREUM]: '0x6b175474e89094c44da98b954eedeac495271d0f',
          [Networks.SCROLL]: '0xca77eb3fefe3725dc33bccb54edefc3d9f764f97',
          [Networks.SEPOLIA]: null,
        },
        decimals: 18,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
      },
      {
        id: '8',
        name: 'tBTC',
        symbol: 'tBTC',
        addresses: {
          [Networks.ETHEREUM]: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
          [Networks.SCROLL]: null,
          [Networks.SEPOLIA]: null,
        },
        decimals: 18,
        logoUrl:
          'https://s2.coinmarketcap.com/static/img/coins/200x200/26133.png',
      },
      {
        id: '9',
        name: 'Lombard Staked BTC',
        symbol: 'LBTC',
        addresses: {
          [Networks.ETHEREUM]: '0x8236a87084f8B84306f72007F36F2618A5634494',
          [Networks.SCROLL]: null,
          [Networks.SEPOLIA]: null,
        },
        decimals: 8,
        logoUrl:
          'https://img.cryptorank.io/coins/lombard_staked_btc1725876587975.png',
      },
      {
        id: '10',
        name: 'Uniswap',
        symbol: 'UNI',
        addresses: {
          [Networks.ETHEREUM]: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
          [Networks.SCROLL]: '0x434cdA25E8a2CA5D9c1C449a8Cb6bCbF719233E8',
          [Networks.SEPOLIA]: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
        },
        decimals: 18,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
      },
      {
        id: '11',
        name: 'Chainlink',
        symbol: 'LINK',
        addresses: {
          [Networks.ETHEREUM]: '0x514910771af9ca656af840dff83e8264ecf986ca',
          [Networks.SCROLL]: null,
          [Networks.SEPOLIA]: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
        },
        decimals: 18,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
      },
      {
        id: '12',
        name: 'Aave',
        symbol: 'AAVE',
        addresses: {
          [Networks.ETHEREUM]: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
          [Networks.SCROLL]: '0x79379c0e09a41d7978f883a56246290ee9a8c4d3',
          [Networks.SEPOLIA]: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
        },
        decimals: 18,
        logoUrl:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png',
      },
      {
        id: '13',
        name: 'Scroll',
        symbol: 'SCR',
        addresses: {
          [Networks.ETHEREUM]: null,
          [Networks.SCROLL]: '0xd29687c813D741E2F938F4aC377128810E217b1b',
          [Networks.SEPOLIA]: null,
        },
        decimals: 18,
        logoUrl:
          'https://s2.coinmarketcap.com/static/img/coins/200x200/26998.png',
      },
    ];

    expect(tokenList).toEqual(expectedList);
  });
});
