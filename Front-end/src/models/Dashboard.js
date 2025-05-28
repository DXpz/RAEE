export class DashboardData {
  constructor(wasteReceived, processedTonnes, maxCapacity, environmentalIndicators, alerts) {
    this.wasteReceived = wasteReceived
    this.processedTonnes = processedTonnes
    this.maxCapacity = maxCapacity
    this.environmentalIndicators = environmentalIndicators
    this.alerts = alerts
  }

  get capacityPercentage() {
    return (this.processedTonnes / this.maxCapacity) * 100
  }

  get criticalAlerts() {
    return this.alerts.filter((alert) => alert.priority === "high")
  }
} 