# DB Outage

**Detection**: 500s in metrics, DB connection errors

**Steps**:
1. Restart DB: `fly postgres restart ecotrack-db`
2. Restore latest snapshot if needed
3. Notify #infra in Slack
