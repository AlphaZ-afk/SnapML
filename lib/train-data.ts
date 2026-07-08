// Mock data that a real ML backend would eventually return.
// Kept in one place so the UI stays consistent and easy to wire up later.

export type FeatureImportance = {
  feature: string
  importance: number
}

export type ModelResult = {
  name: string
  accuracy: number
  f1: number
  precision: number
  recall: number
  trainTime: string
  status: "champion" | "tuned" | "baseline"
}

export type PredictionField = {
  name: string
  label: string
  type: "number" | "select"
  placeholder?: string
  options?: string[]
}

export const featureImportances: FeatureImportance[] = [
  { feature: "annual_income", importance: 0.28 },
  { feature: "credit_score", importance: 0.22 },
  { feature: "account_age", importance: 0.16 },
  { feature: "num_transactions", importance: 0.12 },
  { feature: "avg_balance", importance: 0.09 },
  { feature: "region", importance: 0.07 },
  { feature: "has_mortgage", importance: 0.06 },
]

export const modelResults: ModelResult[] = [
  { name: "XGBoost (tuned)", accuracy: 0.941, f1: 0.933, precision: 0.939, recall: 0.928, trainTime: "42s", status: "champion" },
  { name: "LightGBM", accuracy: 0.929, f1: 0.921, precision: 0.924, recall: 0.918, trainTime: "31s", status: "tuned" },
  { name: "Random Forest", accuracy: 0.911, f1: 0.902, precision: 0.907, recall: 0.898, trainTime: "55s", status: "tuned" },
  { name: "Logistic Regression", accuracy: 0.864, f1: 0.851, precision: 0.858, recall: 0.845, trainTime: "6s", status: "baseline" },
  { name: "Decision Tree", accuracy: 0.842, f1: 0.829, precision: 0.836, recall: 0.822, trainTime: "9s", status: "baseline" },
]

export const champion = modelResults[0]

export const performanceHistory = [
  { round: "Baseline", score: 0.864 },
  { round: "AutoML", score: 0.911 },
  { round: "Tuning", score: 0.929 },
  { round: "Optimized", score: 0.941 },
  { round: "Feedback v1", score: 0.948 },
]

export const aiInsights: string[] = [
  "The dataset is moderately imbalanced (68% / 32%). SnapML applied class weighting to protect recall on the minority class.",
  "annual_income and credit_score together account for 50% of predictive power — collecting cleaner values here yields the biggest gains.",
  "XGBoost outperformed the linear baseline by 7.7 accuracy points after hyperparameter tuning across 120 trials.",
  "No significant data leakage detected. 3 near-duplicate rows were removed during preprocessing.",
]

export const predictionFields: PredictionField[] = [
  { name: "annual_income", label: "Annual income", type: "number", placeholder: "e.g. 82000" },
  { name: "credit_score", label: "Credit score", type: "number", placeholder: "e.g. 710" },
  { name: "account_age", label: "Account age (months)", type: "number", placeholder: "e.g. 36" },
  { name: "num_transactions", label: "Monthly transactions", type: "number", placeholder: "e.g. 24" },
  { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
  { name: "has_mortgage", label: "Has mortgage", type: "select", options: ["Yes", "No"] },
]

export const datasetSummary = {
  rows: 24817,
  columns: 14,
  target: "will_churn",
  task: "Binary classification",
  missingHandled: 312,
}
