export const PLATFORM_NAME = 'تحالف سوربان موجة البحر الأبيض المتوسط';
export const PLATFORM_FOOTER = 'تحالف سوربان موجة البحر الأبيض المتوسط';

export function formatClock(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatTimeInArabic(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  let mPart = '';
  if (m === 1) {
    mPart = 'دقيقة واحدة';
  } else if (m === 2) {
    mPart = 'دقيقتين';
  } else if (m >= 3 && m <= 10) {
    mPart = `${m} دقائق`;
  } else if (m > 10) {
    mPart = `${m} دقيقة`;
  }

  let sPart = '';
  if (s === 1) {
    sPart = 'ثانية واحدة';
  } else if (s === 2) {
    sPart = 'ثانيتين';
  } else if (s >= 3 && s <= 10) {
    sPart = `${s} ثوانٍ`;
  } else if (s > 10) {
    sPart = `${s} ثانية`;
  }

  if (mPart && sPart) {
    return `${mPart} و ${sPart}`;
  }
  if (mPart) {
    return mPart;
  }
  if (sPart) {
    return sPart;
  }
  return 'أقل من ثانية';
}

export function buildResultMessage({ user, levelName, correct, wrong, timeFormatted, timeSeconds }) {
  const coach = user.coach?.trim() || '—';
  const country = user.country?.trim() || '—';
  const timeArabic = typeof timeSeconds === 'number' ? formatTimeInArabic(timeSeconds) : '';

  const lines = [
    '🌟 *نتيجة اختبار الحساب الذهني* 🌟',
    `🏫 *منصة ${PLATFORM_NAME}*`,
  ];

  if (timeArabic) {
    lines.push(`🏆 *أحسنت يا بطل! لقد أنهيت العمليات في ${timeArabic} (${timeFormatted})*`);
  }

  lines.push(
    `👤 *اسم البطل:* ${user.name}`,
    `📚 *المستوى:* ${levelName}`,
    `🎂 *العمر:* ${user.age} سنوات`,
    `🌍 *الدولة:* ${country}`,
    `👩‍🏫 *اسم المدرب:* ${coach}`,
    '━━━━━━━━━━━━━━━',
    `✅ *الإجابات الصحيحة:* ${correct}`,
    `❌ *الإجابات الخاطئة:* ${wrong}`,
    `⏱️ *الوقت المستغرق:* ${timeFormatted}${timeArabic ? ` (${timeArabic})` : ''}`,
    '━━━━━━━━━━━━━━━',
    `✨ *${PLATFORM_FOOTER}*`
  );

  return lines.join('\n');
}
