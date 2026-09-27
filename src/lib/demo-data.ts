import { HistoricalMemory, MemoryChain, TimelineItem, ProjectInput } from '../types';

export const SYNTHETIC_DEMO_DATA_NOTICE = 'Synthetic enterprise memory dataset calibrated for organizational risk simulation.';

export const SAMPLE_PROJECT_INPUTS: Record<string, ProjectInput> = {
  phoenix: {
    name: 'Phoenix API Migration',
    description: 'We are migrating our customer core API to a Kubernetes multi-cluster infrastructure. Expected peak traffic is approximately 70,000 requests per hour. The system relies on the central shared PostgreSQL cluster and uses the standard canary deployment pipeline shared with customer billing services.',
    technology: 'Node.js, Express, PostgreSQL 15, Kubernetes, Nginx Ingress',
    expectedScale: '70,000 req/hr peak, 450 concurrent connections',
    criticalDependencies: 'Shared core PostgreSQL database, Redis session cache, Envoy mesh',
    rolloutPlan: 'Canary rollout: 10% traffic for 30 minutes, followed by 50% and 100% automatic cutover over 2 hours.',
    knownConcerns: 'Shared database connection pool exhaustion during peak hours; potential latency spikes during canary traffic shift.'
  },
  sentinel: {
    name: 'Sentinel Auth V2 Migration',
    description: 'Migrating internal session auth to OAuth2 / OpenID Connect with short-lived JWT tokens across multi-region services. Token verification will happen at the edge API gateway.',
    technology: 'Go, Envoy Gateway, OIDC Provider, Redis cluster',
    expectedScale: '120,000 active sessions, 3 global regions',
    criticalDependencies: 'Auth0 / Okta OIDC issuer, edge gateway cache, public key JWKS endpoint',
    rolloutPlan: 'Blue/Green cluster switchover at midnight with 5-minute DNS TTL propagation.',
    knownConcerns: 'Edge gateway JWKS cache staleness during key rotation and clock skew across regions.'
  },
  pulse: {
    name: 'Pulse Realtime Telemetry Ingestion',
    description: 'Upgrading IoT device telemetry ingest stream from HTTP polling to high-throughput RabbitMQ message queues with auto-scaling consumer workers.',
    technology: 'RabbitMQ, Python Celery, TimescaleDB',
    expectedScale: '25,000 events/sec, burst up to 80,000/sec',
    criticalDependencies: 'RabbitMQ broker cluster, shared disk volume, worker database pool',
    rolloutPlan: 'Parallel run alongside legacy ingestion pipeline for 48 hours with dual-write comparison.',
    knownConcerns: 'Dead-letter queue saturation when malformed payload schemas pass initial validation.'
  }
};

export const ENTERPRISE_MEMORY_CHAINS: MemoryChain[] = [
  {
    id: 'chain-orion-db-2025',
    project: 'Project Orion',
    year: 2025,
    similarityScore: 0.94,
    matchReason: 'Direct match on shared core database dependency, connection pool exhaustion risks under peak traffic, and automatic canary progression.',
    warning: {
      text: 'Principal DBA warned 3 weeks before launch: "The shared PostgreSQL cluster will hit connection pool saturation if Orion pushes >400 persistent connections alongside the billing service."',
      date: '2025-03-14',
      raisedBy: 'D. Vance (Principal Database Architect)'
    },
    decision: {
      text: 'Project lead decided to proceed with launch schedule without pre-scaling read replicas, assuming client-side pooling in Node.js would smooth connection spikes.',
      rationale: 'Postponing launch would miss the Q1 board commitment.'
    },
    action: {
      text: 'Launched Orion API to 100% production traffic without enabling pgBouncer transaction pooling or load testing the shared database under combined service loads.'
    },
    outcome: {
      text: 'Shared database reached 98% CPU and maxed out connection limit (500/500). Cascading 504 Gateway Timeouts degraded both Orion and the mission-critical Billing API for 87 minutes.',
      severity: 'critical',
      incidentReportUrl: 'INC-2025-089'
    },
    lesson: {
      text: 'Never launch a new high-throughput tier sharing core database instances without dedicated connection pooling (pgBouncer in transaction mode) and an end-to-end artificial burst drill under combined workloads.',
      postmortemDate: '2025-04-02'
    },
    futureRisk: {
      text: 'High vulnerability to shared database starvation. If Phoenix API deploys against the same cluster without isolated connection ceilings, billing and customer checkout will degrade.',
      recommendation: 'Enforce dedicated pgBouncer connection pool limits and mandate synthetic multi-service burst load testing before approving rollout.'
    }
  },
  {
    id: 'chain-valkyrie-ratelimit-2024',
    project: 'Valkyrie Gateway',
    year: 2024,
    similarityScore: 0.88,
    matchReason: 'Matched on canary rollout strategy, API traffic amplification, and absence of jittered backoff on client retries.',
    warning: {
      text: 'SRE lead noted during architectural review: "The 30-minute canary window is insufficient to reveal retry storm amplification when upstream microservices experience slight latency."',
      date: '2024-08-11',
      raisedBy: 'M. Chen (Staff SRE)'
    },
    decision: {
      text: 'Maintained the 30-minute automated canary progression to avoid lengthening deployment deployment pipelines.',
      rationale: 'Automated health checks showed 200 OK responses during synthetic health pings.'
    },
    action: {
      text: 'Promoted canary to 50% traffic during peak morning volume while upstream payment partner was experiencing an 800ms response degradation.'
    },
    outcome: {
      text: 'Aggressive client retries amplified traffic by 4.2x within 6 minutes, saturating ingress gateway workers and causing a near-miss total outage requiring manual rollback.',
      severity: 'high',
      incidentReportUrl: 'INC-2024-142'
    },
    lesson: {
      text: 'Canary health checks must measure upstream p99 latency and retry multipliers, not just standard HTTP 200 status codes. All client SDKs must enforce jittered exponential backoff.',
      postmortemDate: '2024-09-01'
    },
    futureRisk: {
      text: 'Automated canary progression without upstream latency saturation gates risks promoting unhealthy releases into production traffic.',
      recommendation: 'Configure canary gates on p99 latency thresholds and verified circuit-breaker trip counts.'
    }
  },
  {
    id: 'chain-atlas-rollback-2024',
    project: 'Project Atlas',
    year: 2024,
    similarityScore: 0.82,
    matchReason: 'Matched on rollout plan with automated cutover and database schema dependency risks during rollback.',
    warning: {
      text: 'Senior engineer submitted review comment: "The database migration script contains a destructive column drop in the down-migration, making instant rollback impossible once applied."',
      date: '2024-11-04',
      raisedBy: 'S. Patel (Senior Backend Engineer)'
    },
    decision: {
      text: 'Accepted the risk to hit the release cutoff, intending to patch any rollout glitches with forward fixes rather than rolling back.',
      rationale: 'Team felt confident that staging tests had verified the migration logic.'
    },
    action: {
      text: 'Deployed database schema migration simultaneously with the new service container deployment.'
    },
    outcome: {
      text: 'Service bug necessitated immediate rollback, but executing the rollback corrupted 1,200 user records due to schema incompatibility with the previous code version.',
      severity: 'critical',
      incidentReportUrl: 'INC-2024-210'
    },
    lesson: {
      text: 'Strictly enforce the Expand-Contract (Two-Phase) migration pattern. Code must support both old and new schema versions before any schema alterations are finalized.',
      postmortemDate: '2024-11-20'
    },
    futureRisk: {
      text: 'Risk of irreversible deployment failure if any database schema modifications lack backwards-compatible dual-read support.',
      recommendation: 'Audit all database changes against the expand-contract checklist before scheduling canary cutover.'
    }
  },
  {
    id: 'chain-sentinel-auth-2024',
    project: 'Sentinel Identity',
    year: 2024,
    similarityScore: 0.79,
    matchReason: 'Matched on authentication token handling and edge gateway cache invalidation.',
    warning: {
      text: 'Security architect warned: "Clock skew between multi-region edge nodes and token issuer will trigger false expired-token rejections if leeway is set to 0 seconds."',
      date: '2024-05-19',
      raisedBy: 'A. Kowalski (Lead Security Engineer)'
    },
    decision: {
      text: 'Strict zero-second clock leeway was kept in production configuration to maximize security compliance requirements.',
      rationale: 'Audit compliance checklist recommended strict expiration validation.'
    },
    action: {
      text: 'Pushed JWT validation configuration live across all regional edge Envoy clusters simultaneously.'
    },
    outcome: {
      text: 'Over 14,000 active users in European region were repeatedly logged out over a 4-hour period due to an 850ms NTP drift on edge nodes.',
      severity: 'high',
      incidentReportUrl: 'INC-2024-067'
    },
    lesson: {
      text: 'Always configure a 30-to-60 second clock skew tolerance on distributed JWT validators and sync edge NTP daemons continuously.',
      postmortemDate: '2024-06-03'
    },
    futureRisk: {
      text: 'Token validation failures causing widespread session drops if clock synchronization drifts.',
      recommendation: 'Configure 60s clock skew tolerance and integrate synthetic auth verification into edge canary probes.'
    }
  },
  {
    id: 'chain-boreas-dlq-2023',
    project: 'Boreas Event Stream',
    year: 2023,
    similarityScore: 0.75,
    matchReason: 'Matched on message queue handling, unhandled schema exceptions, and worker saturation.',
    warning: {
      text: 'Data engineer warned: "If upstream publishers send payloads missing non-nullable fields, consumer threads will crash in a tight loop and flood the dead-letter queue."',
      date: '2023-10-12',
      raisedBy: 'T. Becker (Data Engineer)'
    },
    decision: {
      text: 'Relied on JSON schema validation at the edge proxy, deferring in-depth worker poison-pill defensive handling to a subsequent sprint.',
      rationale: 'Edge schema validation was believed to catch 100% of malformed payloads.'
    },
    action: {
      text: 'Switched 15 ingestion workers to process telemetry streams without per-message poison-pill isolation.'
    },
    outcome: {
      text: 'A third-party client sent truncated JSON. Ingestion workers crashed repeatedly, dead-letter storage exhausted disk space, and 3.2M events were stalled for 5 hours.',
      severity: 'high',
      incidentReportUrl: 'INC-2023-178'
    },
    lesson: {
      text: 'Message consumers must implement safe poison-pill drop & quarantine mechanisms, with alerting on DLQ ingestion velocity rather than static queue depth.',
      postmortemDate: '2023-11-01'
    },
    futureRisk: {
      text: 'Queue backpressure freezing worker pools if malformed packets are retried indefinitely.',
      recommendation: 'Ensure quarantine dead-letter handling with rate-limited retries.'
    }
  },
  {
    id: 'chain-aegis-dns-2024',
    project: 'Project Aegis',
    year: 2024,
    similarityScore: 0.73,
    matchReason: 'Matched on DNS failover and edge traffic migration.',
    warning: {
      text: 'Network engineer warned: "Downstream ISP caching ignores our 60-second DNS TTL. Failover will leave up to 35% of traffic hitting the legacy decommissioned cluster."',
      date: '2024-02-18',
      raisedBy: 'R. Sterling (Network Engineer)'
    },
    decision: {
      text: 'Decommissioned legacy clusters immediately 2 hours after DNS cutover.',
      rationale: 'Cloud hosting costs for running dual clusters concurrently were high.'
    },
    action: {
      text: 'Terminated legacy instances before ISP DNS caches had fully cleared.'
    },
    outcome: {
      text: 'Users on specific major mobile carriers experienced NXDOMAIN and connection refused errors for 18 hours until cache entries expired.',
      severity: 'medium',
      incidentReportUrl: 'INC-2024-032'
    },
    lesson: {
      text: 'Maintain lightweight reverse-proxy forwarders on legacy endpoints for at least 72 hours following any critical DNS migration.',
      postmortemDate: '2024-03-05'
    },
    futureRisk: {
      text: 'Orphaned traffic hitting terminating infrastructure during domain or ingress transitions.',
      recommendation: 'Maintain redirect forwarders for 72h post-cutover.'
    }
  },
  {
    id: 'chain-apollo-webhook-2025',
    project: 'Project Apollo',
    year: 2025,
    similarityScore: 0.71,
    matchReason: 'Matched on webhook idempotency, high concurrency, and race conditions.',
    warning: {
      text: 'Backend engineer warned: "Payment webhooks from payment gateways can arrive concurrently for the same order under network retries; our database unique constraint alone will cause 500 errors."',
      date: '2025-01-09',
      raisedBy: 'K. Tanaka (Senior Backend Engineer)'
    },
    decision: {
      text: 'Opted for simple database unique index on event_id without Redis distributed lock.',
      rationale: 'Team anticipated webhook retries would be sequential.'
    },
    action: {
      text: 'Deployed payment webhook listener with optimistic concurrency handling.'
    },
    outcome: {
      text: 'During flash sale, 420 duplicate webhook events triggered concurrent processing, causing race condition where 18 customers were double-credited.',
      severity: 'high',
      incidentReportUrl: 'INC-2025-012'
    },
    lesson: {
      text: 'Always gate external webhook processing with distributed mutexes (e.g. Redlock) on idempotent business keys before executing state mutations.',
      postmortemDate: '2025-01-25'
    },
    futureRisk: {
      text: 'Concurrent execution races under load leading to duplicate side effects.',
      recommendation: 'Wrap transactional workflows in distributed locks with 30s TTL.'
    }
  },
  {
    id: 'chain-helios-migration-2023',
    project: 'Helios Data Platform',
    year: 2023,
    similarityScore: 0.69,
    matchReason: 'Matched on database migration lock contention and unindexed foreign keys.',
    warning: {
      text: 'DBA warned: "Adding a foreign key constraint to the 40M-row orders table without NOT VALID will trigger an exclusive table lock lasting over 12 minutes."',
      date: '2023-06-15',
      raisedBy: 'D. Vance (Principal Database Architect)'
    },
    decision: {
      text: 'Scheduled migration for 2:00 AM on Sunday without using the two-step NOT VALID / VALIDATE CONSTRAINT pattern.',
      rationale: 'Traffic was historically 90% lower at 2:00 AM.'
    },
    action: {
      text: 'Executed synchronous ALTER TABLE command during active maintenance window.'
    },
    outcome: {
      text: 'Table lock blocked all incoming checkout transactions, causing connection queue buildup and taking down the entire web portal for 14 minutes.',
      severity: 'critical',
      incidentReportUrl: 'INC-2023-094'
    },
    lesson: {
      text: 'Never execute synchronous constraint validation on large tables. Always create constraints with NOT VALID and validate them in a subsequent background transaction.',
      postmortemDate: '2023-07-02'
    },
    futureRisk: {
      text: 'Table lock cascading across interdependent services during schema updates.',
      recommendation: 'Mandate zero-downtime DDL linter in CI/CD pipeline.'
    }
  },
  {
    id: 'chain-cronos-worker-2024',
    project: 'Cronos Scheduler',
    year: 2024,
    similarityScore: 0.67,
    matchReason: 'Matched on multi-tenant background processing and queue starvation.',
    warning: {
      text: 'Infrastructure engineer warned: "A single enterprise tenant running bulk CSV exports will starve P0 operational notification workers."',
      date: '2024-04-10',
      raisedBy: 'F. Rossi (Infrastructure Engineer)'
    },
    decision: {
      text: 'Combined all background job types into a single Redis Celery queue to simplify worker autoscaling.',
      rationale: 'Autoscaler was thought to spin up enough pods to absorb any tenant spike.'
    },
    action: {
      text: 'Launched consolidated worker cluster without tenant queue segregation.'
    },
    outcome: {
      text: 'Enterprise tenant imported 500,000 leads. Password reset and verification emails were delayed by 3.5 hours for all customers.',
      severity: 'high',
      incidentReportUrl: 'INC-2024-055'
    },
    lesson: {
      text: 'Separate transactional notification queues from bulk background processing, and enforce fair-share tenant rate limits on job submission.',
      postmortemDate: '2024-04-28'
    },
    futureRisk: {
      text: 'Noisy neighbor tenant starving latency-sensitive operational pipelines.',
      recommendation: 'Implement priority queue lanes (P0 interactive vs P2 batch).'
    }
  },
  {
    id: 'chain-zephyr-coldstart-2025',
    project: 'Zephyr Microservices',
    year: 2025,
    similarityScore: 0.65,
    matchReason: 'Matched on autoscaling latency spikes and memory limits under burst traffic.',
    warning: {
      text: 'Performance engineer warned: "JVM microservice containers take 45 seconds to initialize and warm JIT caches; rapid autoscaling during flash traffic will drop connections."',
      date: '2025-02-04',
      raisedBy: 'H. Lindqvist (Staff Performance Engineer)'
    },
    decision: {
      text: 'Relied on default Horizontal Pod Autoscaler (HPA) CPU metrics without pre-provisioning min-replicas.',
      rationale: 'Optimizing for cloud infrastructure budget efficiency.'
    },
    action: {
      text: 'Configured aggressive scale-down policy with zero idle buffer.'
    },
    outcome: {
      text: 'Sudden marketing campaign traffic burst caused 60 pods to initialize at once. The storm of cold starts crashed node CPU and caused 8% error rates for 22 minutes.',
      severity: 'medium',
      incidentReportUrl: 'INC-2025-028'
    },
    lesson: {
      text: 'Pre-warm autoscaled containers with readiness probe grace periods and maintain a minimum headroom buffer proportional to peak ramp-up velocity.',
      postmortemDate: '2025-02-22'
    },
    futureRisk: {
      text: 'Cold-start latency spikes causing cascading timeout loops in downstream callers.',
      recommendation: 'Maintain minimum 25% compute headroom before scheduled peak windows.'
    }
  },
  {
    id: 'chain-hermes-tls-2024',
    project: 'Hermes Partner Gateway',
    year: 2024,
    similarityScore: 0.63,
    matchReason: 'Matched on vendor integration, TLS cipher deprecation, and silent dropped packets.',
    warning: {
      text: 'Security specialist warned: "Deprecating TLS 1.1/1.2 legacy ciphers without auditing partner webhook endpoints will silently break integrations for 12 major vendors."',
      date: '2024-07-08',
      raisedBy: 'N. Zhao (Security Specialist)'
    },
    decision: {
      text: 'Enforced TLS 1.3 only on all ingress gateways on the compliance deadline.',
      rationale: 'Strict compliance policy audit requirements.'
    },
    action: {
      text: 'Disabled legacy ciphers without staged per-partner connection logging.'
    },
    outcome: {
      text: '12 enterprise partners silently failed to deliver order webhook events for 48 hours before support escalations surfaced the issue.',
      severity: 'medium',
      incidentReportUrl: 'INC-2024-118'
    },
    lesson: {
      text: 'Implement protocol telemetry logging to identify affected clients before disabling communication protocols, and provide explicit deprecation notice windows.',
      postmortemDate: '2024-07-26'
    },
    futureRisk: {
      text: 'Silent communication failures when tightening transport protocol security.',
      recommendation: 'Run dark protocol audit logs for 30 days prior to cipher deactivations.'
    }
  },
  {
    id: 'chain-selene-kms-2025',
    project: 'Selene Cloud Export',
    year: 2025,
    similarityScore: 0.61,
    matchReason: 'Matched on cloud provider API rate limits and throttling under high-concurrency export.',
    warning: {
      text: 'Cloud architect warned: "AWS KMS API has a hard quota of 10,000 requests/sec per region. Concurrently decrypting 50,000 files in parallel will trigger hard throttling."',
      date: '2025-01-18',
      raisedBy: 'E. Morales (Cloud Architect)'
    },
    decision: {
      text: 'Executed massive export script across 100 parallel worker threads without envelope encryption data-key caching.',
      rationale: 'Speed of customer data export was prioritized.'
    },
    action: {
      text: 'Spawned unthrottled batch workers calling kms:Decrypt for each payload record.'
    },
    outcome: {
      text: 'KMS throttled the entire AWS account. Key operations for all production services in the region failed, causing cross-system outages for 65 minutes.',
      severity: 'critical',
      incidentReportUrl: 'INC-2025-021'
    },
    lesson: {
      text: 'Always utilize client-side data key caching with AWS Encryption SDK to avoid hitting central cryptographic API quotas during batch processing.',
      postmortemDate: '2025-02-08'
    },
    futureRisk: {
      text: 'Cloud management API rate-limits cascading into unrelated services within the same cloud account.',
      recommendation: 'Audit batch scripts for central API call multiplication and enforce envelope caching.'
    }
  }
];

export const ALL_HISTORICAL_MEMORIES: HistoricalMemory[] = [
  {
    id: 'mem-1',
    project: 'Project Orion',
    year: 2025,
    date: '2025-03-14',
    category: 'warning',
    title: 'Shared PostgreSQL Connection Pool Saturation Warning',
    text: 'Principal DBA warned: "The shared PostgreSQL cluster will hit connection pool saturation if Orion pushes >400 persistent connections alongside the billing service."',
    impact: 'Predicted potential multi-service database starvation during peak traffic.',
    tags: ['database', 'postgresql', 'connection-pool', 'capacity', 'orion'],
    author: 'D. Vance (Principal Database Architect)'
  },
  {
    id: 'mem-2',
    project: 'Project Orion',
    year: 2025,
    date: '2025-03-20',
    category: 'decision',
    title: 'Launch Proceeded Without Read-Replica Pre-Scaling',
    text: 'Engineering management approved launch on schedule without pgBouncer transaction pooling or scaling read replicas, relying on Node.js client-side pool ceilings.',
    impact: 'Left core database infrastructure unprotected against connection bursts.',
    tags: ['decision', 'orion', 'architecture', 'schedule-pressure'],
    author: 'Project Leadership'
  },
  {
    id: 'mem-3',
    project: 'Project Orion',
    year: 2025,
    date: '2025-03-28',
    category: 'outcome',
    title: 'P0 Cascading Outage on Shared Database & Billing',
    text: 'PostgreSQL maxed out connections at 500/500 with 98% CPU. Both Orion and Billing experienced 504 Gateway Timeouts for 87 minutes until emergency reboot.',
    impact: '87 minutes downtime, 42,000 dropped requests, revenue impact estimated at $180,000.',
    tags: ['incident', 'outage', 'p0', 'orion', 'database'],
    author: 'Incident Response Commander'
  },
  {
    id: 'mem-4',
    project: 'Project Orion',
    year: 2025,
    date: '2025-04-02',
    category: 'lesson',
    title: 'Mandatory Dedicated Connection Pooling & Shared DB Stress Testing',
    text: 'Never launch a new high-throughput tier sharing core database instances without dedicated connection pooling (pgBouncer in transaction mode) and an end-to-end artificial burst drill under combined workloads.',
    impact: 'Institutional rule created: all shared database clients must use transactional proxy pooling.',
    tags: ['lesson', 'best-practice', 'database', 'orion'],
    author: 'Postmortem Committee'
  },
  {
    id: 'mem-5',
    project: 'Valkyrie Gateway',
    year: 2024,
    date: '2024-08-11',
    category: 'warning',
    title: 'Canary Window Too Short for Retry Amplification Detection',
    text: 'SRE lead noted during architectural review: "The 30-minute canary window is insufficient to reveal retry storm amplification when upstream microservices experience slight latency."',
    impact: 'Identified blind spot in automated canary deployment promotion gates.',
    tags: ['canary', 'deployment', 'retry-storm', 'valkyrie'],
    author: 'M. Chen (Staff SRE)'
  },
  {
    id: 'mem-6',
    project: 'Valkyrie Gateway',
    year: 2024,
    date: '2024-08-25',
    category: 'outcome',
    title: 'Near-Miss Ingress Worker Collapse from 4.2x Retry Storm',
    text: 'Aggressive client retries amplified traffic by 4.2x within 6 minutes, saturating ingress gateway workers and causing a near-miss total outage requiring manual rollback.',
    impact: 'Near-miss event: 14% packet loss for 25 minutes before traffic shedder activated.',
    tags: ['near-miss', 'valkyrie', 'traffic-burst', 'ingress'],
    author: 'SRE On-Call'
  },
  {
    id: 'mem-7',
    project: 'Project Atlas',
    year: 2024,
    date: '2024-11-04',
    category: 'warning',
    title: 'Destructive Down-Migration Script Precludes Safe Rollback',
    text: 'Senior engineer submitted review comment: "The database migration script contains a destructive column drop in the down-migration, making instant rollback impossible once applied."',
    impact: 'Highlighted asymmetric risk in zero-downtime deployment plan.',
    tags: ['rollback', 'database', 'migration', 'atlas'],
    author: 'S. Patel (Senior Backend Engineer)'
  },
  {
    id: 'mem-8',
    project: 'Project Atlas',
    year: 2024,
    date: '2024-11-20',
    category: 'lesson',
    title: 'Expand-Contract Two-Phase Migration Enforcement',
    text: 'Strictly enforce the Expand-Contract (Two-Phase) migration pattern. Code must support both old and new schema versions before any schema alterations are finalized.',
    impact: 'CI/CD pipeline updated with automated schema rollback backward compatibility validator.',
    tags: ['lesson', 'schema-migration', 'two-phase', 'atlas'],
    author: 'Architecture Review Board'
  },
  {
    id: 'mem-9',
    project: 'Sentinel Identity',
    year: 2024,
    date: '2024-05-19',
    category: 'warning',
    title: 'Zero-Second Clock Skew Tolerance in Multi-Region Token Validation',
    text: 'Security architect warned: "Clock skew between multi-region edge nodes and token issuer will trigger false expired-token rejections if leeway is set to 0 seconds."',
    impact: 'Identified distributed systems time synchronization vulnerability.',
    tags: ['auth', 'jwt', 'security', 'clock-skew', 'sentinel'],
    author: 'A. Kowalski (Lead Security Engineer)'
  },
  {
    id: 'mem-10',
    project: 'Sentinel Identity',
    year: 2024,
    date: '2024-06-03',
    category: 'lesson',
    title: 'Standardize 60-Second Clock Skew Leeway on Distributed JWT Nodes',
    text: 'Always configure a 30-to-60 second clock skew tolerance on distributed JWT validators and sync edge NTP daemons continuously.',
    impact: 'Zero session drop incidents recorded across regional edge clusters since implementation.',
    tags: ['lesson', 'auth', 'distributed-systems', 'sentinel'],
    author: 'Identity Engineering Team'
  },
  {
    id: 'mem-11',
    project: 'Boreas Event Stream',
    year: 2023,
    date: '2023-10-12',
    category: 'warning',
    title: 'Missing Worker Poison-Pill Quarantine for Truncated JSON Payloads',
    text: 'Data engineer warned: "If upstream publishers send payloads missing non-nullable fields, consumer threads will crash in a tight loop and flood the dead-letter queue."',
    impact: 'Exposed lack of defensive parsing in message stream workers.',
    tags: ['queue', 'dead-letter', 'workers', 'boreas'],
    author: 'T. Becker (Data Engineer)'
  },
  {
    id: 'mem-12',
    project: 'Helios Data Platform',
    year: 2023,
    date: '2023-06-15',
    category: 'warning',
    title: 'Synchronous Foreign Key Constraint Validation on 40M-Row Table',
    text: 'DBA warned: "Adding a foreign key constraint to the 40M-row orders table without NOT VALID will trigger an exclusive table lock lasting over 12 minutes."',
    impact: 'Predicted table lock leading to widespread web portal connection starvation.',
    tags: ['database', 'ddl', 'table-lock', 'helios'],
    author: 'D. Vance (Principal Database Architect)'
  },
  {
    id: 'mem-13',
    project: 'Apollo Payment Engine',
    year: 2025,
    date: '2025-01-09',
    category: 'warning',
    title: 'Concurrent Payment Webhook Race Conditions Without Distributed Locks',
    text: 'Backend engineer warned: "Payment webhooks from payment gateways can arrive concurrently for the same order under network retries; our database unique constraint alone will cause 500 errors."',
    impact: 'Predicted concurrent retry collisions causing inconsistent transaction states.',
    tags: ['payments', 'concurrency', 'idempotency', 'apollo'],
    author: 'K. Tanaka (Senior Backend Engineer)'
  },
  {
    id: 'mem-14',
    project: 'Selene Cloud Export',
    year: 2025,
    date: '2025-01-18',
    category: 'outcome',
    title: 'AWS Account-Wide KMS Rate Throttling Outage',
    text: 'Parallel export workers made 50,000 calls/sec to kms:Decrypt, exhausting account-wide quota and taking down regional production microservices for 65 minutes.',
    impact: 'Cross-service disruption across 6 production systems due to shared cloud account quotas.',
    tags: ['incident', 'cloud', 'aws', 'kms', 'quota', 'selene'],
    author: 'Cloud Operations Commander'
  }
];

export const DEMO_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: 't-1',
    year: 2023,
    date: 'June 2023',
    project: 'Helios Data Platform',
    type: 'warning',
    title: 'Table lock warning on 40M rows',
    description: 'DBA warned of exclusive lock during synchronous foreign key addition.',
    severity: 'high'
  },
  {
    id: 't-2',
    year: 2023,
    date: 'October 2023',
    project: 'Boreas Event Stream',
    type: 'near-miss',
    title: 'Dead-letter queue burst crash',
    description: 'Malformed payloads caused worker thread crash loops and disk saturation.',
    severity: 'high'
  },
  {
    id: 't-3',
    year: 2024,
    date: 'May 2024',
    project: 'Sentinel Identity',
    type: 'warning',
    title: 'Clock skew warning on edge JWT',
    description: 'Security engineer identified risk of false expiration on distributed edge.',
    severity: 'medium'
  },
  {
    id: 't-4',
    year: 2024,
    date: 'August 2024',
    project: 'Valkyrie Gateway',
    type: 'near-miss',
    title: '4.2x retry storm during canary',
    description: 'Short 30-min canary obscured upstream client retry cascade.',
    severity: 'high'
  },
  {
    id: 't-5',
    year: 2024,
    date: 'November 2024',
    project: 'Project Atlas',
    type: 'lesson',
    title: 'Expand-Contract rule mandated',
    description: 'Destructive rollback failure led to mandatory two-phase migration rules.',
    severity: 'critical'
  },
  {
    id: 't-6',
    year: 2025,
    date: 'January 2025',
    project: 'Selene Cloud Export',
    type: 'outcome',
    title: 'Account-wide KMS API throttle',
    description: 'Uncached encryption calls exhausted regional AWS account quota.',
    severity: 'critical'
  },
  {
    id: 't-7',
    year: 2025,
    date: 'March 2025',
    project: 'Project Orion',
    type: 'warning',
    title: 'Shared PostgreSQL connection saturation',
    description: 'DBA warned that 400+ connections would saturate cluster shared with billing.',
    severity: 'critical'
  },
  {
    id: 't-8',
    year: 2025,
    date: 'March 2025',
    project: 'Project Orion',
    type: 'outcome',
    title: 'Shared DB 504 outage for 87 minutes',
    description: 'Unprotected burst saturated connection pool, degrading both Orion and billing.',
    severity: 'critical'
  },
  {
    id: 't-9',
    year: 2025,
    date: 'April 2025',
    project: 'Project Orion',
    type: 'lesson',
    title: 'Postmortem: pgBouncer transaction pooling mandated',
    description: 'Never launch shared DB workloads without proxy pooling and combined stress drills.',
    severity: 'low'
  },
  {
    id: 't-10',
    year: 2026,
    date: 'Today',
    project: 'Phoenix API Migration',
    type: 'risk-echo',
    title: 'Risk Echo Detected: Replicating Orion Risk Pattern',
    description: 'Current proposal shares the same core database and 30-min canary rollout pattern.',
    severity: 'high'
  }
];
