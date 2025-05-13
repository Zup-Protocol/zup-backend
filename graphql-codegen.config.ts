import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema:
    'https://api.studio.thegraph.com/query/108565/zup-dexs-sepolia/version/latest',
  documents: ['./src/graphql/*.graphql'],

  generates: {
    './src/gen/graphql.gen.ts': {
      plugins: [
        'typescript',
        'typescript-graphql-request',
        'typescript-operations',
      ],
    },
  },
  config: {
    scalars: {
      Bytes: 'string',
      BigDecimal: 'string',
      BigInt: 'string',
    },
    documentMode: 'documentNode',
  },
  ignoreNoDocuments: false,
};

export default config;
