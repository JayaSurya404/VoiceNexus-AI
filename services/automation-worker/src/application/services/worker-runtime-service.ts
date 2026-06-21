import { env } from "../../config/env.js";
import { JobExecutionService } from "./job-execution-service.js";
import { JobSchedulerService } from "./job-scheduler-service.js";

export class WorkerRuntimeService {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly scheduler: JobSchedulerService,
    private readonly executor: JobExecutionService,
  ) {}

  start(): void {
    console.log(`[automation-worker] Starting ${env.WORKER_ID} with poll interval ${env.WORKER_POLL_INTERVAL_MS}ms`);
    void this.tick();
    this.timer = setInterval(() => void this.tick(), env.WORKER_POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.scheduler.seedDueSchedules();
      const due = await this.scheduler.findDueSchedules();
      for (const schedule of due) {
        await this.executor.execute(schedule);
      }
    } catch (error) {
      console.error("[automation-worker] Runtime tick failed", error);
    } finally {
      this.running = false;
    }
  }
}
