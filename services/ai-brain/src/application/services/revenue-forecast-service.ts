import type { RevenueForecast, RevenueForecastPeriod } from "../../domain/entities/revenue-forecast.js";
import type { OpportunityRepository, RevenueForecastRepository } from "../ports.js";

export class RevenueForecastService {
  constructor(
    private readonly forecasts: RevenueForecastRepository,
    private readonly opportunities: OpportunityRepository,
  ) {}

  async calculate(organizationId: string, period: RevenueForecastPeriod): Promise<RevenueForecast> {
    const { start, end } = this.periodWindow(period);
    const opportunities = await this.opportunities.listClosingBetween(organizationId, start, end);
    const pipelineValue = opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);
    const weightedRevenue = opportunities.reduce((sum, opportunity) => sum + opportunity.value * opportunity.probability, 0);
    const committedRevenue = opportunities
      .filter((opportunity) => opportunity.probability >= 0.75)
      .reduce((sum, opportunity) => sum + opportunity.value, 0);
    const projectedRevenue = Math.round(weightedRevenue + committedRevenue * 0.15);
    const confidence = opportunities.length > 0 ? Math.min(0.95, 0.55 + opportunities.length * 0.03) : 0.35;

    return this.forecasts.upsert({
      organizationId,
      period,
      periodStart: start,
      periodEnd: end,
      pipelineValue,
      weightedRevenue,
      committedRevenue,
      projectedRevenue,
      opportunityCount: opportunities.length,
      confidence,
    });
  }

  async list(organizationId: string): Promise<RevenueForecast[]> {
    const [monthly, quarterly, yearly] = await Promise.all([
      this.calculate(organizationId, "MONTH"),
      this.calculate(organizationId, "QUARTER"),
      this.calculate(organizationId, "YEAR"),
    ]);
    const existing = await this.forecasts.listByOrganization(organizationId);
    const calculatedIds = new Set([monthly.id, quarterly.id, yearly.id]);
    return [monthly, quarterly, yearly, ...existing.filter((forecast) => !calculatedIds.has(forecast.id))];
  }

  private periodWindow(period: RevenueForecastPeriod): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (period === "MONTH") {
      start.setDate(1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (period === "QUARTER") {
      start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    start.setMonth(0, 1);
    const end = new Date(start);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}
