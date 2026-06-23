import type {
  OptimizationActionRepository,
  OptimizationExperimentRepository,
  OptimizationGoalRepository,
  OptimizationMetricRepository,
  OptimizationOverview,
  OptimizationRecommendationRepository,
  OptimizationResultRepository,
} from "../ports.js";
import { OptimizationActionService } from "./optimization-action-service.js";
import { OptimizationMonitorService } from "./optimization-monitor-service.js";
import { OptimizationRecommendationService } from "./optimization-recommendation-service.js";

export class OptimizationEngineService {
  constructor(
    private readonly monitor: OptimizationMonitorService,
    private readonly recommendationService: OptimizationRecommendationService,
    private readonly actionService: OptimizationActionService,
    private readonly recommendations: OptimizationRecommendationRepository,
    private readonly actions: OptimizationActionRepository,
    private readonly metrics: OptimizationMetricRepository,
    private readonly goals: OptimizationGoalRepository,
    private readonly experiments: OptimizationExperimentRepository,
    private readonly results: OptimizationResultRepository,
  ) {}

  async overview(organizationId: string): Promise<OptimizationOverview> {
    await this.monitor.monitor(organizationId);
    await this.recommendationService.generate(organizationId);
    await this.actionService.createActions(organizationId);
    const [recommendations, actions, metrics, goals, experiments, results] = await Promise.all([
      this.recommendations.listOpenByOrganization(organizationId),
      this.actions.listByOrganization(organizationId),
      this.metrics.listByOrganization(organizationId),
      this.goals.listByOrganization(organizationId),
      this.experiments.listByOrganization(organizationId),
      this.results.listByOrganization(organizationId),
    ]);
    const impactTotal = results.reduce((sum, result) => sum + result.impactPercent, 0);

    return {
      activeRecommendationCount: recommendations.length,
      pendingActionCount: actions.filter((action) => action.status === "PENDING").length,
      breachedMetricCount: metrics.filter((metric) => metric.status === "BREACHED").length,
      activeGoalCount: goals.filter((goal) => goal.status === "ACTIVE").length,
      runningExperimentCount: experiments.filter((experiment) => experiment.status === "RUNNING").length,
      averageImpact: results.length ? impactTotal / results.length : 0,
    };
  }
}
