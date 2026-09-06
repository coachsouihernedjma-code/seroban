export const PLATFORM_NAME = 'تحالف سوربان موجة البحر الأبيض المتوسط';
export const PLATFORM_FOOTER = 'تحالف سوربان موجة البحر الأبيض المتوسط';

export function formatClock(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function buildResultMessage({ user, levelName, correct, wrong, timeFormatted }) {
  const coach = user.coach?.trim() || '—';
  const country = user.country?.trim() || '—';

  return [
    '🌟 *نتيجة اختبار الحساب الذهني* 🌟',
    `🏫 *منصة ${PLATFORM_NAME}*`,
    `👤 *اسم البطل:* ${user.name}`,
    `📚 *المستوى:* ${levelName}`,
    `🎂 *العمر:* ${user.age} سنوات`,
    `🌍 *الدولة:* ${country}`,
    `👩‍🏫 *اسم المدرب:* ${coach}`,
    '━━━━━━━━━━━━━━━',
    `✅ *الإجابات الصحيحة:* ${correct}`,
    `❌ *الإجابات الخاطئة:* ${wrong}`,
    `⏱️ *الوقت المستغرق:* ${timeFormatted}`,
    '━━━━━━━━━━━━━━━',
    `✨ *${PLATFORM_FOOTER}*`,
  ].join('\n');
}
