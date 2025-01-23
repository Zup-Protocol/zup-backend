import { Module } from '@nestjs/common';
// import { CountService } from './count.service';
import { CountController } from './count.controller';
import { CoreModule } from '@/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [CountController],
  // providers: [CountService],
})
export class CountModule {}
