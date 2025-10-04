import type { } from 'vite/client';

export type DomaEventType =
  | 'NAME_TOKEN_MINTED'
  | 'NAME_TOKEN_BURNED'
  | 'NAME_TOKEN_TRANSFERRED'
  | 'VAULT_CREATED'
  | 'BORROWED'
  | 'REPAID'
  | string; // allow forward-compat

export interface DomaEvent {
  id: number;
  name?: string;
  tokenId?: string;
  type: DomaEventType;
  uniqueId: string;
  relayId?: string;
  eventData: Record<string, any> & {
    networkId?: string;
    finalized?: boolean;
    txHash?: string;
    blockNumber?: string | number;
    logIndex?: number;
  };
}

export interface PollResponse {
  events: DomaEvent[];
  lastId: number;
  hasMoreEvents: boolean;
}

const BASE_URL = 'https://api-testnet.doma.xyz';

function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Request timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

function buildHeaders(apiKey: string): HeadersInit {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Api-Key': apiKey,
  };
}

export async function pollEvents(params: {
  apiKey: string;
  eventTypes?: DomaEventType[];
  limit?: number;
  finalizedOnly?: boolean;
}): Promise<PollResponse> {
  const { apiKey, eventTypes, limit, finalizedOnly = true } = params;
  if (!apiKey) throw new Error('Poll API requires an API key');

  const sp = new URLSearchParams();
  if (typeof limit === 'number' && limit > 0) sp.set('limit', String(limit));
  if (eventTypes && eventTypes.length) {
    for (const t of eventTypes) sp.append('eventTypes', t);
  }
  sp.set('finalizedOnly', String(!!finalizedOnly));

  const url = `${BASE_URL}/v1/poll${sp.toString() ? `?${sp.toString()}` : ''}`;
  const res = await withTimeout(fetch(url, { headers: buildHeaders(apiKey) }));

  if (res.status === 401) throw new Error('Unauthorized: API Key is missing or invalid');
  if (res.status === 403) throw new Error("Forbidden: API Key missing 'EVENTS' permission");
  if (!res.ok) throw new Error(`Poll failed: HTTP ${res.status}`);

  const json = await res.json();
  return json as PollResponse;
}

export async function ackEvents(params: { apiKey: string; lastEventId: number }): Promise<void> {
  const { apiKey, lastEventId } = params;
  if (!apiKey) throw new Error('Ack requires an API key');
  if (!Number.isFinite(lastEventId)) throw new Error('Invalid lastEventId');

  const url = `${BASE_URL}/v1/poll/ack/${lastEventId}`;
  const res = await withTimeout(fetch(url, { method: 'POST', headers: buildHeaders(apiKey) }));

  if (res.status === 401) throw new Error('Unauthorized: API Key is missing or invalid');
  if (res.status === 403) throw new Error("Forbidden: API Key missing 'EVENTS' permission");
  if (!res.ok) throw new Error(`Ack failed: HTTP ${res.status}`);
}

export async function resetPoll(params: { apiKey: string; eventId: number }): Promise<void> {
  const { apiKey, eventId } = params;
  if (!apiKey) throw new Error('Reset requires an API key');
  if (!Number.isFinite(eventId) || eventId < 0) throw new Error('Invalid eventId');

  const url = `${BASE_URL}/v1/poll/reset/${eventId}`;
  const res = await withTimeout(fetch(url, { method: 'POST', headers: buildHeaders(apiKey) }));

  if (res.status === 401) throw new Error('Unauthorized: API Key is missing or invalid');
  if (res.status === 403) throw new Error("Forbidden: API Key missing 'EVENTS' permission");
  if (!res.ok) throw new Error(`Reset failed: HTTP ${res.status}`);
}

