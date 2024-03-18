import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schema/subscriber.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from 'src/jobs/shema/job.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService,
    private mailerService: MailerService,
    private configService: ConfigService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>

  ) { }

  @Get()
  @Public()
  @ResponseMessage("Test email")
  @Cron("* 0 0 * * 0")
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async handleTestEmail(@User() user: IUser) {

    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
      if (jobWithMatchingSkills?.length > 0) {
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company.name,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
            skills: item.skills

          }
        })
        await this.mailerService.sendMail({
          to: [subs.email],
          from: '"Team vieclam.it" <support@example.com>',
          subject: 'Welcome to Nice App! Confirm your Email',
          template: 'new-job',
          context: {
            "userNameReceiver": subs.name,
            "email": subs.email,
            "imageUrl": `https://hust.edu.vn/uploads/sys/logo-dhbk-1-02_130_191.png`,
            "jobs": jobs
          }
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
  //   console.log("hihi")
  // }

}
