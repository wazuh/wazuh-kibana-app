import { jobs, SaveDocument, SchedulerJob } from './index';
import cron from 'node-cron';

export class SchedulerHandler {
  server: object;
  schedulerJobs: SchedulerJob[];
  constructor(server) {
    this.server = server;
    this.schedulerJobs = [];
    new SaveDocument(server)
  }

  async run() {
    for (const job of jobs) {
      const schedulerJob:SchedulerJob = new SchedulerJob(job, this.server);
      this.schedulerJobs.push(schedulerJob);
      const task = cron.schedule(
        job.interval,
        async () => await schedulerJob.run(),
      )
    }
  }
}