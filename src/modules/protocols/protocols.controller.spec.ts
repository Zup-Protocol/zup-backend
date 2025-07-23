import { ProtocolDTO } from 'src/core/dtos/protocol.dto';
import { ProtocolsController } from './protocols.controller';
import { ProtocolsService } from './protocols.service';
// import { any } from 'jest-mock-extended';
import mock from 'jest-mock-extended/lib/Mock';

describe('ProtocolsController', () => {
  const protocolsService = mock<ProtocolsService>();
  let sut: ProtocolsController;

  beforeEach(() => {
    protocolsService.getAllSupportedProtocols.mockResolvedValue([]);

    sut = new ProtocolsController(protocolsService);
  });

  it('Should get the supported protocols from the service when calling the /protocols endpoint', async () => {
    const expectedResult: ProtocolDTO[] = [
      { id: '1', name: 'name', url: 'url', logo: 'logo' },
      { id: '2', name: 'name', url: 'url', logo: 'logo' },
    ];

    protocolsService.getAllSupportedProtocols.mockResolvedValue(expectedResult);

    const result = await sut.getProtocols();

    expect(result).toEqual(expectedResult);
  });
});
