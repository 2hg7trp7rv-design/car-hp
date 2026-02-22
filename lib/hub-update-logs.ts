// lib/hub-update-logs.ts
import raw from "@/data/hub-update-logs.json";

export type HubUpdateLogEntry = {
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
};

type HubUpdateLogsShape = {
  version?: number;
  generatedAt?: string;
  note?: string;
  hubs?: Record<string, HubUpdateLogEntry[] | undefined>;
};

const data = raw as HubUpdateLogsShape;

export function getHubUpdateLog(hubId: string): HubUpdateLogEntry[] {
  if (!hubId) return [];
  const list = data?.hubs?.[hubId];
  return Array.isArray(list) ? (list as HubUpdateLogEntry[]) : [];
}

export function getHubUpdateLogMeta(): Pick<
  HubUpdateLogsShape,
  "version" | "generatedAt" | "note"
> {
  return {
    version: data?.version,
    generatedAt: data?.generatedAt,
    note: data?.note,
  };
}
