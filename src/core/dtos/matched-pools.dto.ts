import { SupportedPoolType } from '../types';
import { PoolSearchFiltersDTO } from './pool-search-filters.dto';

export interface MatchedPoolsDTO {
  pools: SupportedPoolType[];
  filters: PoolSearchFiltersDTO;
}
