### 📂 Application Code (Node.js)
```
├── app.js                     [3KB]  - Express.js API server
├── app.test.js               [2KB]  - Jest unit tests
├── package.json              [1KB]  - Dependencies and scripts
└── .gitignore                [1KB]  - Git exclusions
```

**Purpose:** Complete Node.js API application ready for containerization
**Key Features:** Health checks, API endpoints, comprehensive tests

---

### 🐳 Docker & Container Files
```
├── Dockerfile                 [1KB]  - Multi-stage Docker build
├── .dockerignore              [1KB]  - Docker build optimizations
└── docker-compose.yml         [3KB]  - Local development environment
```

**Purpose:** Container images and local development setup
**Key Features:** Security hardening, minimal image size, local stack

---

### 🔄 CI/CD Pipeline
```
└── Jenkinsfile                [8KB]  - Complete Jenkins pipeline
```

**10 Pipeline Stages:**
1. Checkout
2. Build
3. Unit Tests
4. Code Quality
5. Docker Build
6. Security Scan
7. Push to ECR
8. Deploy to Kubernetes
9. Verify Deployment
10. Smoke Tests

**Purpose:** Automated build, test, and deployment
**Key Features:** Error handling, logging, rollback support

---

### ☸️ Kubernetes Manifests
```
├── k8s-namespace.yaml         [1KB]  - Production namespace
├── k8s-configmap.yaml         [2KB]  - Application configuration
├── k8s-secret.yaml            [2KB]  - Sensitive data
├── k8s-deployment.yaml        [7KB]  - Pod deployment & PDB
├── k8s-service.yaml           [5KB]  - Service & RBAC & Network policies
├── k8s-ingress.yaml           [6KB]  - ALB ingress controller
└── k8s-hpa.yaml               [4KB]  - Horizontal Pod Autoscaler
```

**Directory Structure:** Create `k8s/` folder and add all files
**Purpose:** Production-grade Kubernetes deployment
**Key Features:** 
- Rolling updates with zero downtime
- Health checks (3 types)
- Auto-scaling (3-10 pods)
- Security (RBAC, network policies)
- High availability

---

### 📦 Helm Charts (Template-based)
```
├── helm-chart-yaml.txt        [1KB]  - Chart metadata (rename to Chart.yaml)
└── helm-values.yaml           [5KB]  - Configuration values
```

**Directory Structure:** Create `helm/` folder with:
```
helm/
├── Chart.yaml        (copy from helm-chart-yaml.txt)
├── values.yaml       (copy from helm-values.yaml)
├── values-prod.yaml  (custom production values)
├── values-staging.yaml
└── templates/        (Kubernetes manifests)
```

**Purpose:** Template-based deployments across environments
**Key Features:** Environment-specific configs, DRY principle

