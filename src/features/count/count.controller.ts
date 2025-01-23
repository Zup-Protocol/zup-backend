import { Controller } from '@nestjs/common';
// import { CountService } from './count.service';
// import { GetAllCountsQuery } from '@/graphql/types/generated';

@Controller('counts')
export class CountController {
  constructor(/**private readonly countService: CountService*/) {}

  // @Get()
  // async getLastIncrements(): Promise<GetAllCountsQuery['countIncrements']> {
  //   return this.countService.getLastIncrements();
  // }

  // @Get('/last')
  // async getLastIncrement(): Promise<{ lastIncrement: string }> {
  //   const increment = await this.countService.getLastIncrement();
  //   return { lastIncrement: increment.number };
  // }
}
