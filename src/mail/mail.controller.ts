import { convertSlug } from './../utils/function';
import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import {
  Public,
  ResponseMessage,
  User,
} from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schema/subscriber.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  Job,
  JobDocument,
} from 'src/jobs/shema/job.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { link } from 'fs';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    private configService: ConfigService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Send email successfully')
  // @Cron('* 0 0 * * 0')
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleTestEmail(@User() user: IUser) {
    const subscribers = await this.subscriberModel.find({});
    const currentDate = new Date();

    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills =
        await this.jobModel.find({
          skills: { $in: subsSkills },
          endDate: { $gte: currentDate },
        });
      if (jobWithMatchingSkills?.length > 0) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ',',
              ) + ' đ',
            skills: item.skills,
            id: item.id,
            link: `http://localhost:3000/job/${convertSlug(
              item.name,
            )}?id=${item.id}`,
          };
        });
        const jobsDisplay = jobs.slice(0, 5);
        console.log('>>> check jobsDisplay', jobsDisplay);
        await this.mailerService.sendMail({
          to: [subs.email],
          from: '"Team vieclam.it" <support@example.com>',
          subject:
            'Welcome to Nice App! Confirm your Email',
          template: 'new-job',
          context: {
            userNameReceiver: subs.name,
            email: subs.email,
            imageUrl: `https://hust.edu.vn/uploads/sys/logo-dhbk-1-02_130_191.png`,
            jobs: jobsDisplay,
          },
        });
      }

      //todo
      //build template
    }

    // await this.mailerService.sendMail({
    //   to: ["tranvanlong6677@gmail.com", "tranvanlong6678@gmail.com"],
    //   from: '"Team vieclam.it" <support@example.com>',
    //   subject: 'Welcome to Nice App! Confirm your Email',
    //   template: 'new-job',
    //   context: {
    //     "userNameReceiver": "Admin",
    //     "email": "admin@gmail.com",
    //     "imageUrl": `https://hust.edu.vn/uploads/sys/logo-dhbk-1-02_130_191.png`,
    //     "jobs": jobs
    //   }
    // });
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  // testCron() {
  // }
}
