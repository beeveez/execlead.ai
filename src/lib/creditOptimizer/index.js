/**
 * Integration Credit Optimizer™ — Central Export
 * ============================================================
 * Platform-wide optimization framework for minimizing Base44
 * Integration Credit consumption while preserving 100%
 * identical functionality.
 *
 * Architecture:
 *   Import → Dedup → AI Dedup → Cache → Guard → Bulk → Metrics
 *
 * Usage:
 *   import { getCachedAIResponse, cacheAIResponse } from "@/lib/creditOptimizer/index.js";
 *   import { guardedUpdate } from "@/lib/creditOptimizer/index.js";
 *   import { getCachedOrCompute } from "@/lib/creditOptimizer/index.js";
 */

export {
  recordMetric,
  getMetrics,
  resetMetrics,
  calculateSavings,
  CREDIT_COSTS,
} from "./creditMetricsEngine";

export {
  getCachedAIResponse,
  cacheAIResponse,
  hasCachedAIResponse,
  clearAICache,
  getAICacheStats,
} from "./aiDeduplicationEngine";

export {
  shouldUpdateEntity,
  guardedUpdate,
  filterChangedRecords,
} from "./entityUpdateGuard";

export {
  getCachedDashboard,
  setCachedDashboard,
  invalidateDashboard,
  getCachedDashboardMeta,
  getCachedOrCompute,
  getDashboardCacheStats,
  DEFAULT_TTL,
} from "./dashboardCache";

export {
  bulkCreateOptimized,
  bulkUpdateOptimized,
  deleteManyOptimized,
  updateManyOptimized,
  createBatchedAudit,
  recordAuditWrite,
} from "./bulkOptimizer";

export {
  isDuplicateImport,
  markImportProcessed,
  filterDuplicateImports,
  clearImportCache,
  getImportCacheStats,
} from "./importDeduplication";