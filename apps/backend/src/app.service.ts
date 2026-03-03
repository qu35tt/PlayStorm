import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import fs from 'fs';
import path from 'path/win32';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  onModuleInit() {
    const tempHlsDir = path.join(process.cwd(), 'temp_hls');

    if(fs.existsSync(tempHlsDir)) {
      fs.rmSync(tempHlsDir, { recursive: true, force: true });
      this.logger.log('Cleared temp_hls directory');
    }
  }
}
