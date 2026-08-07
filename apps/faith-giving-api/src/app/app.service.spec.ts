import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { AppService, AppVersionInfo } from './app.service';
import { UserService } from '@faith-giving/faith-giving.service';

describe('AppService', () => {
  const userService = {
    findAdmins: jest.fn(),
  };

  let service: AppService;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'faith-giving-api-version-'));
    service = new TestAppService(userService as unknown as UserService, tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.BUILD_NUMBER;
    delete process.env.BUILD_VERSION;
    delete process.env.DEPLOYED_AT;
    delete process.env.NODE_ENV;
  });

  it('returns admin data from the user service', () => {
    const admins = [{ id: 'admin-1' }];
    userService.findAdmins.mockReturnValue(admins);

    expect(service.getData()).toEqual({ admins });
  });

  it('reads deployed version metadata from the runtime artifact', () => {
    const version: AppVersionInfo = {
      service: 'faith-giving-api',
      version: '1.0.4',
      buildVersion: '1.0.4-build.1234567890',
      buildNumber: '1234567890',
      buildDate: '2026-08-07T00:00:00Z',
      environment: 'production',
    };

    fs.writeFileSync(path.join(tempDir, 'version.json'), JSON.stringify(version));

    expect(service.getVersion()).toEqual(version);
  });

  it('falls back to the local API package version when no runtime artifact exists', () => {
    process.env.NODE_ENV = 'development';
    process.env.BUILD_NUMBER = 'local';
    process.env.BUILD_VERSION = '1.0.3-local';
    process.env.DEPLOYED_AT = '2026-08-07T00:00:00Z';

    const packageDir = path.join(tempDir, 'apps', 'faith-giving-api');
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify({ version: '1.0.3' }));

    expect(service.getVersion()).toEqual({
      service: 'faith-giving-api',
      version: '1.0.3',
      buildVersion: '1.0.3-local',
      buildNumber: 'local',
      buildDate: '2026-08-07T00:00:00Z',
      environment: 'development',
    });
  });
});

class TestAppService extends AppService {
  constructor(userService: UserService, private readonly testRootDir: string) {
    super(userService);
  }

  protected override getRootDir(): string {
    return this.testRootDir;
  }
}
