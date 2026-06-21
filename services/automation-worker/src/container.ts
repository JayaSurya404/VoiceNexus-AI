import { JobDispatcherService } from "./application/services/job-dispatcher-service.js";
import { JobExecutionService } from "./application/services/job-execution-service.js";
import { JobSchedulerService } from "./application/services/job-scheduler-service.js";
import { RetryService } from "./application/services/retry-service.js";
import { WorkerRuntimeService } from "./application/services/worker-runtime-service.js";
import {
  MongoJobExecutionRepository,
  MongoJobResultRepository,
  MongoJobScheduleRepository,
  MongoSharedWorkflowRepository,
  MongoWorkerActionRepository,
} from "./infrastructure/database/mongoose/repositories/mongo-repositories.js";

export function createContainer() {
  const schedules = new MongoJobScheduleRepository();
  const executions = new MongoJobExecutionRepository();
  const results = new MongoJobResultRepository();
  const sharedWorkflow = new MongoSharedWorkflowRepository();
  const workerActions = new MongoWorkerActionRepository();
  const retry = new RetryService();
  const scheduler = new JobSchedulerService(schedules, sharedWorkflow);
  const dispatcher = new JobDispatcherService(sharedWorkflow, workerActions);
  const executor = new JobExecutionService(schedules, executions, results, dispatcher, retry, workerActions);
  const runtime = new WorkerRuntimeService(scheduler, executor);

  return {
    repositories: { schedules, executions, results, sharedWorkflow, workerActions },
    services: { dispatcher, executor, retry, runtime, scheduler },
  };
}
