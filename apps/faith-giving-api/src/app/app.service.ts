import { UserService } from '@faith-giving/faith-giving.service';
import { Injectable} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AppVersionInfo {
  service: string;
  version: string;
  buildVersion: string;
  buildNumber: string;
  buildDate: string;
  environment: string;
}

@Injectable()
export class AppService {
  private readonly serviceName = 'faith-giving-api';

  constructor(
    private userService: UserService
  ) {}

  getData() {
    let admins = this.userService.findAdmins();
    return { admins: admins };
  }

  getVersion(): AppVersionInfo {
    const deployedVersion = this.readJsonFile(this.getDeployedVersionPath());

    if (deployedVersion) {
      return this.normalizeVersionInfo(deployedVersion);
    }

    return this.normalizeVersionInfo({
      version: this.getLocalPackageVersion(),
      buildNumber: process.env.BUILD_NUMBER || 'local',
      buildDate: process.env.DEPLOYED_AT || new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  }

  private getDeployedVersionPath(): string {
    return path.join(this.getRootDir(), 'version.json');
  }

  private getLocalPackageVersion(): string {
    const packagePaths = [
      path.join(this.getRootDir(), 'apps', 'faith-giving-api', 'package.json'),
      path.join(this.getRootDir(), 'package.json'),
    ];

    for (const packagePath of packagePaths) {
      const packageJson = this.readJsonFile(packagePath);
      if (packageJson?.version) {
        return String(packageJson.version);
      }
    }

    return '0.0.0';
  }

  protected getRootDir(): string {
    return process.cwd();
  }

  private readJsonFile(filePath: string): Record<string, unknown> | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private normalizeVersionInfo(data: Record<string, unknown>): AppVersionInfo {
    const version = String(data.version || '0.0.0');
    const buildNumber = String(data.buildNumber || process.env.BUILD_NUMBER || 'local');

    return {
      service: String(data.service || this.serviceName),
      version,
      buildVersion: String(data.buildVersion || process.env.BUILD_VERSION || `${version}-${buildNumber}`),
      buildNumber,
      buildDate: String(data.buildDate || process.env.DEPLOYED_AT || new Date().toISOString()),
      environment: String(data.environment || process.env.NODE_ENV || 'development'),
    };
  }
}
