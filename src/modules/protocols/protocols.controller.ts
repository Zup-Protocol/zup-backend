import { Controller, Get } from '@nestjs/common';
import { ProtocolDTO } from 'src/core/dtos/protocol.dto';
import { ProtocolsService } from './protocols.service';

@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get()
  async getProtocols(): Promise<ProtocolDTO[]> {
    return this.protocolsService.getAllSupportedProtocols();
  }
}
