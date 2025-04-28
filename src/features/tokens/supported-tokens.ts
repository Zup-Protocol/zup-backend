import { TokenMetadata } from './dto/token.dto';

export const supportedTokens: Record<string, TokenMetadata[]> = {
  mainnet: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    },
    {
      symbol: 'USDC',
      name: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    },
  ],
  sepolia: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      symbol: 'USDC',
      name: 'USDC',
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    },
  ],
  scroll: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ethereum',
      address: '0x5300000000000000000000000000000000000004',
      decimals: 18,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/assets/0x5300000000000000000000000000000000000004/logo.png',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
      decimals: 6,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/assets/0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4/logo.png',
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1',
      decimals: 8,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/assets/0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1/logo.png',
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
      decimals: 6,
      logoUrl:
        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/scroll/assets/0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df/logo.png',
    },
    {
      symbol: 'SCR',
      name: 'Scroll',
      address: '0xd29687c813D741E2F938F4aC377128810E217b1b',
      decimals: 18,
      logoUrl:
        'https://assets.coingecko.com/coins/images/50571/standard/scroll.jpg',
    },
  ],
};
