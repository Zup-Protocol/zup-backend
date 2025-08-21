import { TokenGroupDTO } from './dtos/token-group.dto';
import { tokenList } from './token-list';

export const tokenGroupList: TokenGroupDTO[] = [
  {
    id: 'group-1',
    name: 'USD Stablecoins',
    tokens: tokenList.filter((token) =>
      new Set([
        '3', // USDT
        '4', // USDC
        '7', // DAI
        '25', // USDS
        '26', // USDe
        '27', // USDD
        '28', // TUSD
        '29', // frxUSD
        '30', // LUSD
        '31', // DOLA
        '32', // USDP
        '33', // FDUSD
        '34', // PYUSD
        '35', // USDY
        '36', // GHO
        '37', // AUSD
        '68', // RLUSD
        '76', // rUSDC
        '77', // USDHL
        '78', // hbUSDT
        '79', // feUSD
        '80', // thBILL
      ]).has(token.id!),
    ),
  },
  {
    id: 'group-2',
    name: 'BTC Pegged Tokens',
    tokens: tokenList.filter((token) =>
      new Set([
        '5', // WBTC
        '8', // TBTC
        '38', // FBTC
        '6', // cbBTC
        '19', // BTCB
        '9', // LBTC
        '21', // SolvBTC
        '39', // uniBTC
        '40', // BBTC
        '41', // kBTC
        '42', // EBTC
        '43', // teleBTC
        '44', // 21BTC
        '72', // UBTC
        '83', // hbBTC
      ]).has(token.id!),
    ),
  },
  {
    id: 'group-3',
    name: 'ETH Pegged Tokens',
    tokens: tokenList.filter((token) =>
      new Set([
        '1', // ETH
        '45', // wstETH
        '46', // WBETH
        '47', // weETH
        '48', // rETH
        '49', // rsETH
        '50', // wrsETH
        '51', // mETH
        '52', // lsETH
        '53', // ezETH
        '54', // osETH
        '55', // ETHx
        '56', // cbETH
        '57', // sfrxETH
        '58', // frxETH
        '59', // pufETH
        '60', // xPufETH
        '61', // rswETH
        '62', // swETH
        '63', // woETH
        '64', // oETH
        '65', // superOETH
        '66', // pzETH
        '67', // ankrETH
        '73', // UETH
      ]).has(token.id!),
    ),
  },
  {
    id: 'group-4',
    name: 'HYPE Pegged Tokens',
    tokens: tokenList.filter((token) =>
      new Set([
        '69', // HYPE
        '70', // stHYPE
        '71', // wstHYPE
        '74', // kHYPE
        '75', // LHYPE
      ]).has(token.id!),
    ),
  },
];
