# Architecture & Implementation Plan: Phase 9.6 - Automated Scheduler & Scanner Integration

**Date**: 2026-02-04  
**Status**: ARCHIVED (IMPLEMENTED)  
**Ref**: Plan 042

## 1. Goal
Integrate `AlertScannerWorker` (Realtime) and `MarketRelayWorker` (Scheduled) into a single unified `ai-worker` entry point to ensure fully automated operation without manual intervention.

## 2. Technical Strategy
### 2.1 Unified Entry Point (`worker_entry.py`)
- Utilize `asyncio.gather` for non-blocking concurrent execution of:
  - `Scheduler Loop`: Periodically triggers Market Relay flows.
  - `Redis Scanner`: Continuously listens for market quote updates.
- Centralized logging configuration to handle multi-library log conflicts.

### 2.2 Data Integrity Enforcement
- Implement `sanitize_val` in `MarketRelayWorker` to convert `NaN`/`Infinity` floats to `None`.
- Enhance `BaseFetcher.upsert` with Pandas-based null check (`df.where(pd.notnull(df), None)`) to ensure JSON compliance for Supabase/PostgREST.

## 3. Implementation Details
### `backend/worker_entry.py` [NEW]
- Wraps `schedule.run_pending()` in an async loop.
- Orchestrates `AlertScannerWorker.start()`.

### `backend/etl/base_fetcher.py` [MODIFY]
- Added data sanitization layer before database upsert.

### `backend/workers/market_relay_worker.py` [MODIFY]
- Added value sanitization logic during data transformation.

## 4. Verification Results
- **Log Confirmation**: Scheduler and Scanner both active in a single container process.
- **Bug Fix**: Successfully handled Fugle API anomalies without crashing the worker.
- **Integration**: Real-time alerts generated from scheduled market relay updates confirmed.
