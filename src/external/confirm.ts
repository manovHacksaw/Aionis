export type ConfirmFailureKind = 'infrastructure' | 'prediction';

export interface ConfirmSuccess {
  confirmed: true;
  revenue:   number;
}

export interface ConfirmFailure {
  confirmed: false;
  reason:    string;
  kind:      ConfirmFailureKind;
}

export type ConfirmResult = ConfirmSuccess | ConfirmFailure;

interface ConfirmRequestBody {
  agent_id:     string;
  result:       Record<string, unknown>;
  execution_ms: number;
}

interface ConfirmResponseBody {
  confirmed: boolean;
  task_id:   string;
  revenue?:  number;
  reason?:   string;
}

// Calls the coordinator's completion endpoint and classifies the result.
//
// Failure kind rules:
//   infrastructure — coordinator unreachable, network error, 5xx
//                    → caller should REFUND the agent's cost
//   prediction     — coordinator rejected the completion (expired, already claimed, bad result)
//                    → caller should ABSORB the cost (the agent made a prediction error)
export async function confirmTaskComplete(
  coordinatorUrl: string,
  taskId:         string,
  body:           ConfirmRequestBody,
): Promise<ConfirmResult> {
  const url = `${coordinatorUrl}/tasks/${taskId}/complete`;

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(5_000),
    });
  } catch (err) {
    return {
      confirmed: false,
      kind:      'infrastructure',
      reason:    `coordinator_unreachable: ${(err as Error).message}`,
    };
  }

  if (res.status >= 500) {
    return {
      confirmed: false,
      kind:      'infrastructure',
      reason:    `coordinator_server_error_${res.status}`,
    };
  }

  if (res.status === 404) {
    return { confirmed: false, kind: 'prediction', reason: 'task_not_found_at_coordinator' };
  }

  if (!res.ok) {
    return { confirmed: false, kind: 'prediction', reason: `coordinator_http_${res.status}` };
  }

  let data: ConfirmResponseBody;
  try {
    data = await res.json() as ConfirmResponseBody;
  } catch {
    return {
      confirmed: false,
      kind:      'infrastructure',
      reason:    'coordinator_response_not_json',
    };
  }

  if (data.confirmed) {
    const revenue = data.revenue;
    if (typeof revenue !== 'number' || !Number.isInteger(revenue) || revenue <= 0) {
      // Coordinator confirmed but sent invalid revenue — this is a coordinator bug.
      // Treat as infrastructure failure so the agent is made whole.
      return {
        confirmed: false,
        kind:      'infrastructure',
        reason:    `coordinator_confirmed_invalid_revenue: ${String(revenue)}`,
      };
    }
    return { confirmed: true, revenue };
  }

  return {
    confirmed: false,
    kind:      'prediction',
    reason:    data.reason ?? 'coordinator_rejected',
  };
}
