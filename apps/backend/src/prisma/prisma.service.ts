import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger(PrismaService.name);
    
    constructor() {
        // 1. Create a database pool using your environment variable
        const connectionString = process.env.DATABASE_URL;
        const pool = new Pool({ connectionString });
        
        // 2. Wrap it in the Prisma Adapter
        const adapter = new PrismaPg(pool);
        
        // 3. Pass the adapter to the PrismaClient constructor
        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Database connected successfully');
        } catch (err) {
            this.logger.error(`Database connection failed: ${err.message}`);
        }
    }
}
