import { dashboardSummary } from '../store.js';

export async function summary(req, res) {
  res.json(await dashboardSummary(req.user.id));
}
