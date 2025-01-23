// import { Injectable } from '@nestjs/common';
// import {
//   GET_COUNTS,
//   GET_LAST_INCREMENT,
// } from '@/graphql/queries/count.queries';
// import { GraphQLService } from '@/core/services/graphql.service';
// import { GetLastIncrementQuery } from '@/graphql/types/generated';
// import { GetAllCountsQuery } from '@/graphql/types/generated';

// @Injectable()
// export class CountService {
//   constructor(private readonly graphqlService: GraphQLService) {}

//   async getLastIncrements(): Promise<GetAllCountsQuery['countIncrements']> {
//     const { countIncrements } =
//       await this.graphqlService.query<GetAllCountsQuery>(GET_COUNTS);
//     return countIncrements;
//   }

//   async getLastIncrement(): Promise<GetAllCountsQuery['countIncrements'][0]> {
//     const { countIncrements } =
//       await this.graphqlService.query<GetLastIncrementQuery>(
//         GET_LAST_INCREMENT,
//       );
//     return countIncrements[0];
//   }
// }
