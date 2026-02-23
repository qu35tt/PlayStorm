import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path/win32';

@Injectable()
export class AppService {
  onModuleInit() {
    const tempHlsDir = path.join(process.cwd(), 'temp_hls');

    if(!fs.existsSync(tempHlsDir)) {
      fs.rmSync(tempHlsDir, { recursive: true, force: true });
      console.log('Cleared temp_hls directory');
    }
  }
}
