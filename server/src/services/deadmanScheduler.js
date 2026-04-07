import { listDeadmanDispatchCandidates, upsertDeadmanState } from '../store/deadmanStore.js';
import { getMessengerLinks } from '../store/userStore.js';
import { dispatchMessage } from './message.service.js';

function pickReadyChannels(state, links) {
  const channels = [];
  if (state.lineEnabled && String(links?.lineUserId || '').trim()) {
    channels.push('line');
  }
  if (state.telegramEnabled && String(links?.telegramChatId || '').trim()) {
    channels.push('telegram');
  }
  if (state.emailEnabled && String(links?.email || '').trim()) {
    channels.push('email');
  }
  return channels;
}

export async function runDeadmanDispatchScan(now = Date.now()) {
  const candidates = await listDeadmanDispatchCandidates(now, 200);
  if (!candidates.length) {
    return { scanned: 0, sent: 0, skipped: 0, failed: 0 };
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const state of candidates) {
    try {
      const links = await getMessengerLinks(state.userId);
      const channels = pickReadyChannels(state, links);
      const text = String(state.emergencyText || '').trim();

      if (!channels.length || !text) {
        skipped += 1;
        continue;
      }

      await dispatchMessage({
        userId: state.userId,
        channels,
        text,
      });

      await upsertDeadmanState(state.userId, {
        lastDispatchedForCheckinAt: state.lastCheckInAt,
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[deadman-scan] dispatch failed userId=${state.userId} reason=${reason}`);
    }
  }

  return { scanned: candidates.length, sent, skipped, failed };
}

export function startDeadmanScheduler(intervalMs) {
  const safeInterval = Math.max(10_000, Number(intervalMs) || 60_000);

  const tick = async () => {
    try {
      const result = await runDeadmanDispatchScan(Date.now());
      if (result.scanned > 0) {
        console.log(
          `[deadman-scan] scanned=${result.scanned} sent=${result.sent} skipped=${result.skipped} failed=${result.failed}`
        );
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[deadman-scan] failed reason=${reason}`);
    }
  };

  const timer = setInterval(() => {
    void tick();
  }, safeInterval);

  void tick();
  return () => clearInterval(timer);
}
