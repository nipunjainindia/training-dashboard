import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from './analytics/analytics.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TrainingsModule } from './trainings/trainings.module';
import { Training } from './trainings/training.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [Training],
        synchronize: false, // Set to true only for initial dev; use migrations in prod
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      }),
    }),
    TrainingsModule,
    AnalyticsModule,
    ChatbotModule,
  ],
})
export class AppModule {}
