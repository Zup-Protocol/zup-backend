import { GraphQLClient, RequestOptions } from 'graphql-request';
import { DocumentNode } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: string; output: string; }
  BigInt: { input: string; output: string; }
  Bytes: { input: string; output: string; }
  Int8: { input: number; output: number; }
  Timestamp: { input: any; output: any; }
};

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Pool = {
  __typename?: 'Pool';
  createdAtTimestamp: Scalars['BigInt']['output'];
  dailyData: Array<Maybe<PoolDailyData>>;
  feeTier: Scalars['Int']['output'];
  hourlyData: Array<Maybe<PoolHourlyData>>;
  id: Scalars['Bytes']['output'];
  protocol: Protocol;
  tickSpacing: Scalars['Int']['output'];
  token0: Token;
  token1: Token;
  totalValueLockedToken0: Scalars['BigDecimal']['output'];
  totalValueLockedToken1: Scalars['BigDecimal']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
};


export type PoolDailyDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolDailyData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PoolDailyData_Filter>;
};


export type PoolHourlyDataArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolHourlyData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PoolHourlyData_Filter>;
};

export type PoolDailyData = {
  __typename?: 'PoolDailyData';
  dayStartTimestamp: Scalars['BigInt']['output'];
  feesToken0: Scalars['BigDecimal']['output'];
  feesToken1: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  id: Scalars['Bytes']['output'];
  pool: Pool;
  totalValueLockedToken0: Scalars['BigDecimal']['output'];
  totalValueLockedToken1: Scalars['BigDecimal']['output'];
  totalValueLockedUSD: Scalars['BigDecimal']['output'];
};

export type PoolDailyData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PoolDailyData_Filter>>>;
  dayStartTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  dayStartTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  dayStartTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  dayStartTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  dayStartTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  dayStartTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  dayStartTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  dayStartTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PoolDailyData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLockedToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum PoolDailyData_OrderBy {
  DayStartTimestamp = 'dayStartTimestamp',
  FeesToken0 = 'feesToken0',
  FeesToken1 = 'feesToken1',
  FeesUsd = 'feesUSD',
  Id = 'id',
  Pool = 'pool',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolId = 'pool__id',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD',
  TotalValueLockedToken0 = 'totalValueLockedToken0',
  TotalValueLockedToken1 = 'totalValueLockedToken1',
  TotalValueLockedUsd = 'totalValueLockedUSD'
}

export type PoolHourlyData = {
  __typename?: 'PoolHourlyData';
  feesToken0: Scalars['BigDecimal']['output'];
  feesToken1: Scalars['BigDecimal']['output'];
  feesUSD: Scalars['BigDecimal']['output'];
  hourStartTimestamp: Scalars['BigInt']['output'];
  id: Scalars['Bytes']['output'];
  pool: Pool;
};

export type PoolHourlyData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PoolHourlyData_Filter>>>;
  feesToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  feesUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  feesUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  hourStartTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  hourStartTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  hourStartTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  hourStartTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  hourStartTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  hourStartTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  hourStartTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  hourStartTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<PoolHourlyData_Filter>>>;
  pool?: InputMaybe<Scalars['String']['input']>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']['input']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_gt?: InputMaybe<Scalars['String']['input']>;
  pool_gte?: InputMaybe<Scalars['String']['input']>;
  pool_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_lt?: InputMaybe<Scalars['String']['input']>;
  pool_lte?: InputMaybe<Scalars['String']['input']>;
  pool_not?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains?: InputMaybe<Scalars['String']['input']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with?: InputMaybe<Scalars['String']['input']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum PoolHourlyData_OrderBy {
  FeesToken0 = 'feesToken0',
  FeesToken1 = 'feesToken1',
  FeesUsd = 'feesUSD',
  HourStartTimestamp = 'hourStartTimestamp',
  Id = 'id',
  Pool = 'pool',
  PoolCreatedAtTimestamp = 'pool__createdAtTimestamp',
  PoolFeeTier = 'pool__feeTier',
  PoolId = 'pool__id',
  PoolTickSpacing = 'pool__tickSpacing',
  PoolTotalValueLockedToken0 = 'pool__totalValueLockedToken0',
  PoolTotalValueLockedToken1 = 'pool__totalValueLockedToken1',
  PoolTotalValueLockedUsd = 'pool__totalValueLockedUSD'
}

export type Pool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  createdAtTimestamp?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAtTimestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAtTimestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  dailyData_?: InputMaybe<PoolDailyData_Filter>;
  feeTier?: InputMaybe<Scalars['Int']['input']>;
  feeTier_gt?: InputMaybe<Scalars['Int']['input']>;
  feeTier_gte?: InputMaybe<Scalars['Int']['input']>;
  feeTier_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  feeTier_lt?: InputMaybe<Scalars['Int']['input']>;
  feeTier_lte?: InputMaybe<Scalars['Int']['input']>;
  feeTier_not?: InputMaybe<Scalars['Int']['input']>;
  feeTier_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  hourlyData_?: InputMaybe<PoolHourlyData_Filter>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  protocol?: InputMaybe<Scalars['String']['input']>;
  protocol_?: InputMaybe<Protocol_Filter>;
  protocol_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_ends_with?: InputMaybe<Scalars['String']['input']>;
  protocol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_gt?: InputMaybe<Scalars['String']['input']>;
  protocol_gte?: InputMaybe<Scalars['String']['input']>;
  protocol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  protocol_lt?: InputMaybe<Scalars['String']['input']>;
  protocol_lte?: InputMaybe<Scalars['String']['input']>;
  protocol_not?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains?: InputMaybe<Scalars['String']['input']>;
  protocol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  protocol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  protocol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  protocol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  protocol_starts_with?: InputMaybe<Scalars['String']['input']>;
  protocol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tickSpacing?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_gt?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_gte?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  tickSpacing_lt?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_lte?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_not?: InputMaybe<Scalars['Int']['input']>;
  tickSpacing_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  token0?: InputMaybe<Scalars['String']['input']>;
  token0_?: InputMaybe<Token_Filter>;
  token0_contains?: InputMaybe<Scalars['String']['input']>;
  token0_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_gt?: InputMaybe<Scalars['String']['input']>;
  token0_gte?: InputMaybe<Scalars['String']['input']>;
  token0_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_lt?: InputMaybe<Scalars['String']['input']>;
  token0_lte?: InputMaybe<Scalars['String']['input']>;
  token0_not?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains?: InputMaybe<Scalars['String']['input']>;
  token0_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token0_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with?: InputMaybe<Scalars['String']['input']>;
  token0_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1?: InputMaybe<Scalars['String']['input']>;
  token1_?: InputMaybe<Token_Filter>;
  token1_contains?: InputMaybe<Scalars['String']['input']>;
  token1_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_gt?: InputMaybe<Scalars['String']['input']>;
  token1_gte?: InputMaybe<Scalars['String']['input']>;
  token1_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_lt?: InputMaybe<Scalars['String']['input']>;
  token1_lte?: InputMaybe<Scalars['String']['input']>;
  token1_not?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains?: InputMaybe<Scalars['String']['input']>;
  token1_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token1_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with?: InputMaybe<Scalars['String']['input']>;
  token1_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  totalValueLockedToken0?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken0_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken0_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedToken1_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedToken1_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  totalValueLockedUSD_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  totalValueLockedUSD_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Pool_OrderBy {
  CreatedAtTimestamp = 'createdAtTimestamp',
  DailyData = 'dailyData',
  FeeTier = 'feeTier',
  HourlyData = 'hourlyData',
  Id = 'id',
  Protocol = 'protocol',
  ProtocolId = 'protocol__id',
  ProtocolLogo = 'protocol__logo',
  ProtocolName = 'protocol__name',
  ProtocolPositionManager = 'protocol__positionManager',
  ProtocolUrl = 'protocol__url',
  TickSpacing = 'tickSpacing',
  Token0 = 'token0',
  Token0Decimals = 'token0__decimals',
  Token0Id = 'token0__id',
  Token0UsdPrice = 'token0__usdPrice',
  Token1 = 'token1',
  Token1Decimals = 'token1__decimals',
  Token1Id = 'token1__id',
  Token1UsdPrice = 'token1__usdPrice',
  TotalValueLockedToken0 = 'totalValueLockedToken0',
  TotalValueLockedToken1 = 'totalValueLockedToken1',
  TotalValueLockedUsd = 'totalValueLockedUSD'
}

export type Protocol = {
  __typename?: 'Protocol';
  id: Scalars['String']['output'];
  logo: Scalars['String']['output'];
  name: Scalars['String']['output'];
  positionManager: Scalars['Bytes']['output'];
  url: Scalars['String']['output'];
};

export type Protocol_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Protocol_Filter>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id_gt?: InputMaybe<Scalars['String']['input']>;
  id_gte?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_lt?: InputMaybe<Scalars['String']['input']>;
  id_lte?: InputMaybe<Scalars['String']['input']>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  logo_contains?: InputMaybe<Scalars['String']['input']>;
  logo_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  logo_ends_with?: InputMaybe<Scalars['String']['input']>;
  logo_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  logo_gt?: InputMaybe<Scalars['String']['input']>;
  logo_gte?: InputMaybe<Scalars['String']['input']>;
  logo_in?: InputMaybe<Array<Scalars['String']['input']>>;
  logo_lt?: InputMaybe<Scalars['String']['input']>;
  logo_lte?: InputMaybe<Scalars['String']['input']>;
  logo_not?: InputMaybe<Scalars['String']['input']>;
  logo_not_contains?: InputMaybe<Scalars['String']['input']>;
  logo_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  logo_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  logo_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  logo_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  logo_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  logo_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  logo_starts_with?: InputMaybe<Scalars['String']['input']>;
  logo_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<Protocol_Filter>>>;
  positionManager?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_contains?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_gt?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_gte?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  positionManager_lt?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_lte?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_not?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  positionManager_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  url?: InputMaybe<Scalars['String']['input']>;
  url_contains?: InputMaybe<Scalars['String']['input']>;
  url_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  url_ends_with?: InputMaybe<Scalars['String']['input']>;
  url_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  url_gt?: InputMaybe<Scalars['String']['input']>;
  url_gte?: InputMaybe<Scalars['String']['input']>;
  url_in?: InputMaybe<Array<Scalars['String']['input']>>;
  url_lt?: InputMaybe<Scalars['String']['input']>;
  url_lte?: InputMaybe<Scalars['String']['input']>;
  url_not?: InputMaybe<Scalars['String']['input']>;
  url_not_contains?: InputMaybe<Scalars['String']['input']>;
  url_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  url_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  url_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  url_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  url_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  url_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  url_starts_with?: InputMaybe<Scalars['String']['input']>;
  url_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum Protocol_OrderBy {
  Id = 'id',
  Logo = 'logo',
  Name = 'name',
  PositionManager = 'positionManager',
  Url = 'url'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  pool?: Maybe<Pool>;
  poolDailyData?: Maybe<PoolDailyData>;
  poolDailyDatas: Array<PoolDailyData>;
  poolHourlyData?: Maybe<PoolHourlyData>;
  poolHourlyDatas: Array<PoolHourlyData>;
  pools: Array<Pool>;
  protocol?: Maybe<Protocol>;
  protocols: Array<Protocol>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolDailyDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolDailyDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolDailyData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolDailyData_Filter>;
};


export type QueryPoolHourlyDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPoolHourlyDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolHourlyData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolHourlyData_Filter>;
};


export type QueryPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pool_Filter>;
};


export type QueryProtocolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProtocolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Protocol_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Protocol_Filter>;
};


export type QueryTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  pool?: Maybe<Pool>;
  poolDailyData?: Maybe<PoolDailyData>;
  poolDailyDatas: Array<PoolDailyData>;
  poolHourlyData?: Maybe<PoolHourlyData>;
  poolHourlyDatas: Array<PoolHourlyData>;
  pools: Array<Pool>;
  protocol?: Maybe<Protocol>;
  protocols: Array<Protocol>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionPoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPoolDailyDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPoolDailyDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolDailyData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolDailyData_Filter>;
};


export type SubscriptionPoolHourlyDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionPoolHourlyDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<PoolHourlyData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<PoolHourlyData_Filter>;
};


export type SubscriptionPoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Pool_Filter>;
};


export type SubscriptionProtocolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProtocolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Protocol_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Protocol_Filter>;
};


export type SubscriptionTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Token_Filter>;
};

export type Token = {
  __typename?: 'Token';
  decimals: Scalars['Int']['output'];
  id: Scalars['Bytes']['output'];
  usdPrice: Scalars['BigDecimal']['output'];
};

export type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['Bytes']['input']>;
  id_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_gt?: InputMaybe<Scalars['Bytes']['input']>;
  id_gte?: InputMaybe<Scalars['Bytes']['input']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  id_lt?: InputMaybe<Scalars['Bytes']['input']>;
  id_lte?: InputMaybe<Scalars['Bytes']['input']>;
  id_not?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Token_Filter>>>;
  usdPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  usdPrice_gt?: InputMaybe<Scalars['BigDecimal']['input']>;
  usdPrice_gte?: InputMaybe<Scalars['BigDecimal']['input']>;
  usdPrice_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
  usdPrice_lt?: InputMaybe<Scalars['BigDecimal']['input']>;
  usdPrice_lte?: InputMaybe<Scalars['BigDecimal']['input']>;
  usdPrice_not?: InputMaybe<Scalars['BigDecimal']['input']>;
  usdPrice_not_in?: InputMaybe<Array<Scalars['BigDecimal']['input']>>;
};

export enum Token_OrderBy {
  Decimals = 'decimals',
  Id = 'id',
  UsdPrice = 'usdPrice'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type GetPoolDataQueryVariables = Exact<{
  poolId: Scalars['ID']['input'];
  dayStartTimestamp: Scalars['BigInt']['input'];
  hourStartTimestamp: Scalars['BigInt']['input'];
}>;


export type GetPoolDataQuery = { __typename?: 'Query', pool?: { __typename?: 'Pool', id: string, totalValueLockedUSD: string, totalValueLockedToken0: string, totalValueLockedToken1: string, feeTier: number, tickSpacing: number, createdAtTimestamp: string, protocol: { __typename?: 'Protocol', name: string, logo: string, url: string, id: string, positionManager: string }, token0: { __typename?: 'Token', id: string, usdPrice: string }, token1: { __typename?: 'Token', id: string, usdPrice: string }, dailyData: Array<{ __typename?: 'PoolDailyData', feesUSD: string, totalValueLockedUSD: string, dayStartTimestamp: string } | null>, hourlyData: Array<{ __typename?: 'PoolHourlyData', feesUSD: string, hourStartTimestamp: string } | null> } | null };

export type GetPoolsByTokenIdsQueryVariables = Exact<{
  token0Id: Scalars['Bytes']['input'];
  token1Id: Scalars['Bytes']['input'];
}>;


export type GetPoolsByTokenIdsQuery = { __typename?: 'Query', pools: Array<{ __typename?: 'Pool', id: string }> };


export const GetPoolDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPoolData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"poolId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dayStartTimestamp"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hourStartTimestamp"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pool"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"poolId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"protocol"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"positionManager"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalValueLockedUSD"}},{"kind":"Field","name":{"kind":"Name","value":"totalValueLockedToken0"}},{"kind":"Field","name":{"kind":"Name","value":"totalValueLockedToken1"}},{"kind":"Field","name":{"kind":"Name","value":"feeTier"}},{"kind":"Field","name":{"kind":"Name","value":"tickSpacing"}},{"kind":"Field","name":{"kind":"Name","value":"createdAtTimestamp"}},{"kind":"Field","name":{"kind":"Name","value":"token0"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"usdPrice"}}]}},{"kind":"Field","name":{"kind":"Name","value":"token1"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"usdPrice"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dailyData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"EnumValue","value":"desc"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"dayStartTimestamp"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"dayStartTimestamp_gte"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dayStartTimestamp"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feesUSD"}},{"kind":"Field","name":{"kind":"Name","value":"totalValueLockedUSD"}},{"kind":"Field","name":{"kind":"Name","value":"dayStartTimestamp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hourlyData"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"EnumValue","value":"desc"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"hourStartTimestamp"}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"hourStartTimestamp_gte"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hourStartTimestamp"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feesUSD"}},{"kind":"Field","name":{"kind":"Name","value":"hourStartTimestamp"}}]}}]}}]}}]} as unknown as DocumentNode;
export const GetPoolsByTokenIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPoolsByTokenIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token0Id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Bytes"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token1Id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Bytes"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"or"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"token0_"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token0Id"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"token1_"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token1Id"}}}]}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"token0_"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token1Id"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"token1_"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token0Id"}}}]}}]}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GetPoolData(variables: GetPoolDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPoolDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPoolDataQuery>(GetPoolDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPoolData', 'query', variables);
    },
    GetPoolsByTokenIds(variables: GetPoolsByTokenIdsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPoolsByTokenIdsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPoolsByTokenIdsQuery>(GetPoolsByTokenIdsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPoolsByTokenIds', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;