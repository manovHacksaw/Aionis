export type WorkFailureKind = 'infrastructure' | 'prediction';

export interface WorkSuccess {
  success:     true;
  data:        Record<string, unknown>;
  source:      string;
  fetchedAtMs: number;
  durationMs:  number;
}

export interface WorkFailure {
  success: false;
  kind:    WorkFailureKind;
  reason:  string;
}

export type WorkResult = WorkSuccess | WorkFailure;
