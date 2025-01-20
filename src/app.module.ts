import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerModule } from './answer/answer.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';
import { LectureModule } from './lecture/lecture.module';
import { QuestionModule } from './question/question.module';
import { UserProgresModule } from './user-progres/user-progres.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    QuestionModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.js, .ts}'],
      }),
      inject: [ConfigService],
    }),
    LectureModule,
    ImageModule,
    AnswerModule,
    UserProgresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
