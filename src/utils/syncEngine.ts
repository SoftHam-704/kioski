import { TableOrSpot, BeachItem, TableTransferLog, EstablishmentProfile } from '../types';

export interface SyncPayload {
  type: 'SYNC_STATE' | 'RESET_STATE' | 'PING';
  tables?: TableOrSpot[];
  menu?: BeachItem[];
  transferLogs?: TableTransferLog[];
  activeProfileId?: string;
  senderNode?: string;
  timestamp: number;
}

const STORAGE_KEY = 'softham_opendesk_db_v1';
const CHANNEL_NAME = 'softham_opendesk_realtime_bus';

export class OpenDeskSyncEngine {
  private channel: BroadcastChannel | null = null;
  private onRemoteSyncCallback: ((payload: SyncPayload) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncPayload>) => {
          if (this.onRemoteSyncCallback && event.data) {
            this.onRemoteSyncCallback(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or restricted in iframe environment', err);
      }
    }
  }

  public subscribe(callback: (payload: SyncPayload) => void) {
    this.onRemoteSyncCallback = callback;
  }

  public broadcastUpdate(data: {
    tables?: TableOrSpot[];
    menu?: BeachItem[];
    transferLogs?: TableTransferLog[];
    activeProfileId?: string;
    senderNode?: string;
  }) {
    // 1. Save to LocalStorage for persistent reloads
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const updated = {
        ...existing,
        tables: data.tables || existing.tables,
        menu: data.menu || existing.menu,
        transferLogs: data.transferLogs || existing.transferLogs,
        activeProfileId: data.activeProfileId || existing.activeProfileId,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }

    // 2. Broadcast to other open tabs / devices
    if (this.channel) {
      try {
        const payload: SyncPayload = {
          type: 'SYNC_STATE',
          tables: data.tables,
          menu: data.menu,
          transferLogs: data.transferLogs,
          activeProfileId: data.activeProfileId,
          senderNode: data.senderNode || 'Terminal-Local',
          timestamp: Date.now(),
        };
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('Failed to broadcast message', e);
      }
    }
  }

  public getSavedState(): {
    tables?: TableOrSpot[];
    menu?: BeachItem[];
    transferLogs?: TableTransferLog[];
    activeProfileId?: string;
  } | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to retrieve state', e);
    }
    return null;
  }

  public exportBackupJson(): string {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw || '{}';
  }

  public clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const syncEngine = new OpenDeskSyncEngine();
