import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import path, { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Job, JobSchema } from 'src/jobs/shema/job.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscriber, SubscriberSchema } from 'src/subscribers/schema/subscriber.schema';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("EMAIL_HOST"),
          secure: false,
          auth: {
            user: configService.get<string>("EMAIL_AUTH_USER"),
            pass: configService.get<string>("PASSWORD_EMAIL"),
          },
        },
        preview: configService.get<string>("EMAIL_PREVIEW") === "true" ? true : false,
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        // options: {
        //   partials: {
        //     dir: path.join(process.env.PWD, 'templates/partials'),
        //     options: {
        //       strict: true,
        //     },
        //   },
        // },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: Subscriber.name, schema: SubscriberSchema }])
  ],
  controllers: [MailController],
  providers: [MailService]
})
export class MailModule { }

