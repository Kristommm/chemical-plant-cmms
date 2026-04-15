# CMMS Pro: Plant Operations & Maintenance

This repository contains the source code for a custom Computerized Maintenance Management System (CMMS) designed specifically for the rigorous demands of chemical manufacturing plants. 

The system acts as the digital backbone for plant safety, regulatory compliance, and equipment reliability, moving operations from reactive firefighting to proactive, data-driven maintenance.

### 🏗️ Architecture (Monorepo)
* **Frontend (`/cmms-frontend`):** A Single Page Application (SPA) built with React, Vite, and React Router. It utilizes a feature-sliced architecture to cleanly separate domains (Assets, Maintenance, Safety).
* **Backend (`/cmms-backend`):** A high-performance REST API built with Python and FastAPI. It uses SQLAlchemy 2.0 as the ORM, Alembic for database migrations, and Pydantic for strict data validation.

### ✨ Core Modules
* **Analytics Dashboard:** Real-time KPI tracking for pending work orders, critical PM deadlines, and active safety permits.
* **Maintenance Execution:** Complete Work Order generation, assignment, and status tracking with detailed execution checklists.
* **Asset Hierarchy:** A recursive equipment explorer mapping the complex parent-child relationships of plant infrastructure (Plant > Unit > Equipment > Component).
* **Safety & Compliance (PSM):** Integrated tracking for Permits to Work (PTW), Lockout/Tagout (LOTO) protocols, and Management of Change (MOC) reviews.