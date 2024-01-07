import { Global, Module } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

let cachedDb: Db | null = null;

@Global()
@Module({
  providers: [
    {
      provide: 'MONGO_DB',
      useFactory: async () => {
        if (process.env.NODE_ENV === 'development' && cachedDb) {
          return cachedDb;
        }

        const client = new MongoClient(process.env.DATABASE_URI, {
          monitorCommands: true,
        });
        await client.connect();
        const db = client.db(process.env.DATABASE_NAME);

        if (process.env.NODE_ENV === 'development') {
          cachedDb = db;
        }

        return db;
      },
    },
  ],
  exports: ['MONGO_DB'],
})
export class DbModule {}
