import { Alchemy, Network } from 'alchemy-sdk';

export type AlchemyFactory = (network: Network) => Alchemy;

export const alchemyFactory = (): AlchemyFactory => {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ALCHEMY_API_KEY is not defined in the environment variables',
    );
  }

  return (network: Network) =>
    new Alchemy({
      apiKey,
      network,
    });
};
