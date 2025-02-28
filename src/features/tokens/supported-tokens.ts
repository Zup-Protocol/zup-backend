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
      name: 'USD Coin',
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
  // arbitrum: [
  //   {
  //     symbol: 'ETH',
  //     name: 'Ethereum',
  //     address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'WETH',
  //     name: 'Wrapped Ethereum',
  //     address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'WBTC',
  //     name: 'Wrapped Bitcoin',
  //     address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  //     decimals: 8,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  //     decimals: 6,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'USDT',
  //     name: 'Tether USD',
  //     address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  //     decimals: 6,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'DAI',
  //     name: 'Dai Stablecoin',
  //     address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  // ],
  // base: [
  //   {
  //     symbol: 'ETH',
  //     name: 'Ethereum',
  //     address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'WETH',
  //     name: 'Wrapped Ethereum',
  //     address: '0x4200000000000000000000000000000000000006',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  //     decimals: 6,
  //     logoUrl: '',
  //   },
  // ],
  // scroll: [
  //   {
  //     symbol: 'ETH',
  //     name: 'Ethereum',
  //     address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'WETH',
  //     name: 'Wrapped Ethereum',
  //     address: '0x5300000000000000000000000000000000000004',
  //     decimals: 18,
  //     logoUrl: '',
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
  //     decimals: 6,
  //     logoUrl: '',
  //   },
  // ],
  // bsc: [
  //   {
  //     symbol: 'WBTC',
  //     name: 'Wrapped Bitcoin',
  //     address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'USDT',
  //     name: 'Tether USD',
  //     address: '0x55d398326f99059fF775485246999027B3197955',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'DAI',
  //     name: 'Dai Stablecoin',
  //     address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
  //     decimals: 18,
  //   },
  // ],
  // polygon: [
  //   {
  //     symbol: 'WETH',
  //     name: 'Wrapped Ethereum',
  //     address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'WBTC',
  //     name: 'Wrapped Bitcoin',
  //     address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
  //     decimals: 8,
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  //     decimals: 6,
  //   },
  //   {
  //     symbol: 'USDT',
  //     name: 'Tether USD',
  //     address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  //     decimals: 6,
  //   },
  //   {
  //     symbol: 'DAI',
  //     name: 'Dai Stablecoin',
  //     address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  //     decimals: 18,
  //   },
  // ],
  // optimism: [
  //   {
  //     symbol: 'ETH',
  //     name: 'Ethereum',
  //     address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'WETH',
  //     name: 'Wrapped Ethereum',
  //     address: '0x4200000000000000000000000000000000000006',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'WBTC',
  //     name: 'Wrapped Bitcoin',
  //     address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
  //     decimals: 8,
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  //     decimals: 6,
  //   },
  //   {
  //     symbol: 'USDT',
  //     name: 'Tether USD',
  //     address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  //     decimals: 6,
  //   },
  //   {
  //     symbol: 'DAI',
  //     name: 'Dai Stablecoin',
  //     address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  //     decimals: 18,
  //   },
  // ],
  // avax: [
  //   {
  //     symbol: 'WETH',
  //     name: 'Wrapped Ethereum',
  //     address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
  //     decimals: 18,
  //   },
  //   {
  //     symbol: 'WBTC',
  //     name: 'Wrapped Bitcoin',
  //     address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
  //     decimals: 8,
  //   },
  //   {
  //     symbol: 'USDC',
  //     name: 'USD Coin',
  //     address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  //     decimals: 6,
  //   },
  //   {
  //     symbol: 'USDT',
  //     name: 'Tether USD',
  //     address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  //     decimals: 6,
  //   },
  //   {
  //     symbol: 'DAI',
  //     name: 'Dai Stablecoin',
  //     address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
  //     decimals: 18,
  //   },
  // ],
};
