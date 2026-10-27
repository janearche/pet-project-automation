import { dashboardSummary } from '../store.js';

export async function summary(_req, res) {
  res.json(await dashboardSummary());
}
