import { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config'; // Load environment variables

const config: CodegenConfig = {
  schema: process.env.INDEXER_URL,
  overwrite: true,
  documents: ['./src/graphql/*.graphql'],
  generates: {
    './src/gen/graphql.gen.ts': {
      plugins: ['typescript', 'typescript-graphql-request', 'typescript-operations'],
    },
  },
  config: {
    scalars: {
      pooltype: 'string',
      Bytes: 'string',
      numeric: 'string',
      BigInt: 'string',
      ID: 'string',
    },
    documentMode: 'documentNode',
  },
  ignoreNoDocuments: false,
};

export default config;
