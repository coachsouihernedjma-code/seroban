const ARABIC_ORDINALS = {
  'التحضيري': '0',
  'الأول': '1',
  'الثاني': '2',
  'الثالث': '3',
  'الرابع': '4',
  'التمهيدي': '0',
  'Beginner': '0',
  'Intermediate': '2',
  'Advanced': '3',
  'Grand Master': '4',
  'Champion': '4',
};

function getLevelNum(levelName) {
  if (!levelName || typeof levelName !== 'string') return '1';
  for (const [key, val] of Object.entries(ARABIC_ORDINALS)) {
    if (levelName.includes(key)) return val;
  }
  return '1';
}

function getCategoryNum(catIdOrResult) {
  if (!catIdOrResult) return '1';
  const str = typeof catIdOrResult === 'string'
    ? catIdOrResult
    : (catIdOrResult.categoryId || catIdOrResult.category_id || '');
  const match = str.match(/-(\d+)$/);
  return match ? match[1] : '1';
}

function getCategoryBirthYear(categoryName) {
  if (!categoryName || typeof categoryName !== 'string') return new Date().getFullYear() - 8;
  const year4 = categoryName.match(/(20\d{2})/);
  if (year4) return parseInt(year4[1], 10);
  const match = categoryName.match(/(\d{2})-(\d{2})/);
  if (match) {
    return new Date().getFullYear() - parseInt(match[2], 10);
  }
  return new Date().getFullYear() - 8;
}

function formatCompetitionDate(isoString) {
  if (!isoString) {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      const now = new Date();
      return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  } catch {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  }
}

function getArabicMonthYear() {
  const months = [
    'جانفي', 'فيفري', 'مارس', 'أفريل', 'مايو', 'جوان',
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

async function fetchLogoBase64() {
  try {
    const response = await fetch('/logo.jpg');
    if (!response.ok) return '';
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

function buildLogoCell(logoSrc, align) {
  if (!logoSrc) return `<td width="12%" style="border:none;"></td>`;
  return `
    <td width="12%" align="${align}" style="border:none; vertical-align:middle;">
      <img src="${logoSrc}" width="90" height="90" style="border-radius:50%;" alt="logo" />
    </td>
  `;
}

/**
 * Generate a Word document for a specific level/category results list in Admin Dashboard
 */
export async function generateResultsWordDocument(sortedResults, users = []) {
  if (!sortedResults || sortedResults.length === 0) {
    return '<html><body dir="rtl"><p>لا توجد نتائج مسجلة</p></body></html>';
  }
  const logoSrc = await fetchLogoBase64();
  const firstResult = sortedResults[0] || {};

  // Normalize field names
  const getLevelName = (r) => r.levelName || r.level_name || '—';
  const getCatName = (r) => r.categoryName || r.category_name || '—';
  const getCatId = (r) => r.categoryId || r.category_id || '';
  const getDate = (r) => r.date || r.created_at || new Date().toISOString();

  const levelName = getLevelName(firstResult);
  const catName = getCatName(firstResult);
  const levelNum = getLevelNum(levelName);
  const categoryNum = getCategoryNum(getCatId(firstResult));
  const birthYear = getCategoryBirthYear(catName);
  const competitionDate = formatCompetitionDate(getDate(firstResult));

  const getUser = (r) => {
    const uid = String(r.userId || r.user_id || '');
    const uname = (r.userName || r.user_name || r.studentName || '').trim().toLowerCase();
    return (users || []).find((u) =>
      (uid && String(u.id) === uid) ||
      (uname && (u.name || '').trim().toLowerCase() === uname)
    ) || {};
  };

  const cellStyle = 'background-color:#F5E0ED; border:1px solid #000; text-align:center; padding:6px 4px; font-size:10pt;';

  const rowsHtml = sortedResults.map((r, index) => {
    const user = getUser(r);
    const studentName = user.name || r.userName || r.user_name || r.studentName || '—';
    const birthYearVal = user.birthYear || user.birth_year || (user.age ? `${user.age} سنة` : '—');
    const levelDisplay = r.levelName || r.level_name || user.levelName || levelName;
    const catDisplay = r.categoryName || r.category_name || user.categoryName || catName;
    const scoreDisplay = `${r.score}ع / ${r.total}ع`;
    const timeDisplay = r.timeFormatted || r.time_formatted || (r.timeSeconds ? `${r.timeSeconds} ث` : '—');
    const coachDisplay = user.coach || r.coach || '—';
    const countryDisplay = user.country || user.wilaya || '—';

    return `
      <tr>
        <td style="${cellStyle} font-weight:bold;">${index + 1}</td>
        <td style="${cellStyle} font-weight:bold; color:#1a3a8f; text-align:right; padding-right:8px;">${studentName}</td>
        <td style="${cellStyle}">${birthYearVal}</td>
        <td style="${cellStyle}">${levelDisplay}</td>
        <td style="${cellStyle}">${catDisplay}</td>
        <td style="${cellStyle} color:#CC0000; font-weight:bold;">${scoreDisplay}</td>
        <td style="${cellStyle}">${timeDisplay}</td>
        <td style="${cellStyle} font-weight:bold;">${index + 1}</td>
        <td style="${cellStyle}">${coachDisplay}</td>
        <td style="${cellStyle}">${countryDisplay}</td>
      </tr>
    `;
  }).join('');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>قائمة الأبطال — ${levelName}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DocumentKind>DocumentIntranet</w:DocumentKind>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: A4 landscape; margin: 1.2cm; }
  body {
    font-family: 'Arial', 'Traditional Arabic', 'Simplified Arabic', sans-serif;
    direction: rtl;
    text-align: center;
    margin: 0;
    padding: 0;
  }
  table { border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  td, th { mso-line-height-rule: exactly; }
</style>
</head>
<body dir="rtl">

<table width="100%" style="border:none; margin-bottom:12px;">
  <tr>
    ${buildLogoCell(logoSrc, 'right')}
    <td width="76%" align="center" style="border:none; vertical-align:middle;">
      <p style="margin:2px 0; font-size:16pt; font-weight:bold; color:#1a3a8f;">
        قائمة الأبطال — coach souiher nedjma
      </p>
      <p style="margin:3px 0; font-size:13pt; font-weight:bold; color:#CC0000;">
        ${levelName} — ${catName}
      </p>
      <p style="margin:2px 0; font-size:10.5pt; font-weight:bold; color:#333;">
        تاريخ: ${competitionDate} &nbsp;|&nbsp; م ${levelNum} ف ${categoryNum} (${birthYear})
      </p>
    </td>
    ${buildLogoCell(logoSrc, 'left')}
  </tr>
</table>

<table width="100%" style="border:1px solid #000; margin-top:10px;">
  <thead>
    <tr>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">الرقم</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">الإسم و اللقب</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">تاريخ الميلاد</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">المستوى</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">الفئة</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">ع ع ص</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">التوقيت</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">المركز</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">إسم المدرب</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:10pt; font-weight:bold; color:#000;">الولاية</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
</table>

<p style="text-align:center; color:#64748b; font-size:9pt; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:10px;">
  جميع الحقوق محفوظة © 2026 coach souiher nedjma &nbsp;|&nbsp; Coach.souihernedjma@gmail.com &nbsp;|&nbsp; +213 664 159 368
</p>

</body>
</html>`;
}

/**
 * Generate a comprehensive Word document for all registered users in the platform
 * Contains complete personal information, level, category, chosen coach,
 * and an empty column for registration fees (حقوق التسجيل).
 */
export async function generateAllStudentsReport(students = []) {
  const logoSrc = await fetchLogoBase64();
  const now = new Date();
  const reportDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

  const headerCellStyle = 'background-color:#1e3a8a; color:#ffffff; border:1px solid #1e3a8a; text-align:center; padding:8px 6px; font-size:10pt; font-weight:bold;';
  const rowCellStyle = 'border:1px solid #cbd5e1; text-align:center; padding:7px 5px; font-size:9.5pt; vertical-align:middle;';
  const altRowStyle = 'background-color:#f8fafc;';

  const rowsHtml = (students || []).map((s, idx) => {
    const bgStyle = idx % 2 === 1 ? altRowStyle : '';
    const joinDate = s.joinDate || s.join_date || '';
    const joinDateFmt = joinDate ? joinDate.split('T')[0].replace(/-/g, '/') : '—';
    const birthYearOrAge = s.birthYear || s.birth_year ? `${s.birthYear || s.birth_year} (${s.age || ''} سنة)` : (s.age ? `${s.age} سنة` : '—');
    const levelDisplay = s.levelName || s.level_name || '—';
    const catDisplay = s.categoryName || s.category_name || '—';
    const coachDisplay = s.coach || '—';
    const countryDisplay = s.country || s.wilaya || '—';

    return `<tr style="${bgStyle}">
      <td style="${rowCellStyle} font-weight:bold;">${idx + 1}</td>
      <td style="${rowCellStyle} font-weight:800; color:#1e3a8a; text-align:right; padding-right:10px;">${s.name || '—'}</td>
      <td style="${rowCellStyle}">${birthYearOrAge}</td>
      <td style="${rowCellStyle}">${countryDisplay}</td>
      <td style="${rowCellStyle}">${levelDisplay}</td>
      <td style="${rowCellStyle} font-size:8.5pt; color:#475569;">${catDisplay}</td>
      <td style="${rowCellStyle} font-weight:bold; color:#0f766e;">${coachDisplay}</td>
      <td style="${rowCellStyle} background-color:#fffbeb; min-width:85px;">&nbsp;</td>
      <td style="${rowCellStyle} color:#64748b;">${joinDateFmt}</td>
    </tr>`;
  }).join('');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>القائمة الشاملة لجميع المسجلين</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>95</w:Zoom>
    <w:DocumentKind>DocumentIntranet</w:DocumentKind>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: A4 landscape; margin: 1.2cm; }
  body {
    font-family: 'Arial', 'Traditional Arabic', 'Simplified Arabic', sans-serif;
    direction: rtl;
    text-align: right;
    margin: 0;
    padding: 0;
    font-size: 10pt;
  }
  table { border-collapse: collapse; width: 100%; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  td, th { mso-line-height-rule: exactly; }
  .title-banner {
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13pt;
    font-weight: bold;
    margin: 15px 0 10px 0;
    text-align: center;
  }
</style>
</head>
<body dir="rtl">

<!-- HEADER -->
<table width="100%" style="border:none; margin-bottom:14px; border-bottom: 3px solid #1e3a8a; padding-bottom:10px;">
  <tr>
    ${buildLogoCell(logoSrc, 'right')}
    <td align="center" style="border:none; vertical-align:middle;">
      <p style="margin:2px 0; font-size:18pt; font-weight:900; color:#1e3a8a;">
        القائمة الشاملة لجميع المسجلين في المنصة
      </p>
      <p style="margin:3px 0; font-size:13pt; font-weight:bold; color:#2563eb;">
        coach souiher nedjma
      </p>
      <p style="margin:2px 0; font-size:10pt; color:#64748b;">
        تاريخ الإصدار: ${reportDate} &nbsp;|&nbsp; إجمالي المسجلين: ${students.length} طالب
      </p>
    </td>
    ${buildLogoCell(logoSrc, 'left')}
  </tr>
</table>

<p class="title-banner">📋 بيانات المسجلين الرسمية مع المدربين وحقوق التسجيل (${students.length} طالب)</p>

<table width="100%" style="border:1px solid #cbd5e1; margin-top:8px;">
  <thead>
    <tr>
      <th style="${headerCellStyle} width:35px;">#</th>
      <th style="${headerCellStyle}">اسم الطالب</th>
      <th style="${headerCellStyle}">العمر / سنة الميلاد</th>
      <th style="${headerCellStyle}">البلد / الولاية</th>
      <th style="${headerCellStyle}">المستوى</th>
      <th style="${headerCellStyle}">الفئة العمرية</th>
      <th style="${headerCellStyle}">المدرب المختار</th>
      <th style="${headerCellStyle} background-color:#b45309; width:110px;">حقوق التسجيل</th>
      <th style="${headerCellStyle}">تاريخ التسجيل</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml || `<tr><td colspan="9" style="${rowCellStyle} color:#94a3b8;">لا يوجد طلاب مسجلون</td></tr>`}
  </tbody>
</table>

<p style="text-align:center; color:#94a3b8; font-size:9pt; margin-top:25px; border-top:1px solid #e2e8f0; padding-top:10px;">
  جميع الحقوق محفوظة © 2026 coach souiher nedjma &nbsp;|&nbsp; Coach.souihernedjma@gmail.com &nbsp;|&nbsp; +213 664 159 368
</p>

</body>
</html>`;
}

/**
 * Generate a comprehensive Word document for a coach listing all their students
 * with full info and all their results.
 */
export async function generateCoachStudentsReport(coachName, students = [], results = []) {
  const logoSrc = await fetchLogoBase64();
  const now = new Date();
  const reportDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

  // Styles
  const headerCellStyle = 'background-color:#1e3a8a; color:#ffffff; border:1px solid #1e3a8a; text-align:center; padding:8px 6px; font-size:10pt; font-weight:bold;';
  const rowCellStyle = 'border:1px solid #cbd5e1; text-align:center; padding:7px 5px; font-size:9.5pt; vertical-align:middle;';
  const altRowStyle = 'background-color:#f0f9ff;';

  // Sort results by date descending
  const sortedResults = [...(results || [])].sort((a, b) =>
    new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0)
  );

  // Count results per student
  const studentResultCount = {};
  sortedResults.forEach(r => {
    const key = String(r.userId || r.user_id || '');
    studentResultCount[key] = (studentResultCount[key] || 0) + 1;
  });

  // ─── TABLE 1: STUDENTS LIST ───────────────────────────────────────────────
  const studentsRowsHtml = (students || []).map((s, idx) => {
    const count = studentResultCount[String(s.id)] || 0;
    const avgScoreResults = sortedResults.filter(r =>
      String(r.userId || r.user_id) === String(s.id) ||
      (r.userName || r.user_name || '').trim().toLowerCase() === (s.name || '').trim().toLowerCase()
    );
    const avg = avgScoreResults.length > 0
      ? Math.round(avgScoreResults.reduce((sum, r) => sum + (r.score / (r.total || 1)) * 100, 0) / avgScoreResults.length)
      : 0;
    const bgStyle = idx % 2 === 1 ? altRowStyle : '';
    const joinDate = s.joinDate || s.join_date || '';
    const joinDateFmt = joinDate ? joinDate.split('T')[0].replace(/-/g, '/') : '—';

    return `<tr style="${bgStyle}">
      <td style="${rowCellStyle} font-weight:bold;">${idx + 1}</td>
      <td style="${rowCellStyle} font-weight:800; color:#1e3a8a; text-align:right; padding-right:8px;">${s.name || '—'}</td>
      <td style="${rowCellStyle}">${s.age || '—'} سنة</td>
      <td style="${rowCellStyle}">${s.birthYear || '—'}</td>
      <td style="${rowCellStyle}">${s.country || '—'}</td>
      <td style="${rowCellStyle}">${s.levelName || '—'}</td>
      <td style="${rowCellStyle}">${count}</td>
      <td style="${rowCellStyle} color:${avg >= 70 ? '#166534' : avg >= 50 ? '#92400e' : '#991b1b'}; font-weight:bold;">${avg}%</td>
      <td style="${rowCellStyle}">${joinDateFmt}</td>
    </tr>`;
  }).join('');

  // ─── TABLE 2: ALL RESULTS ────────────────────────────────────────────────
  const resultsRowsHtml = sortedResults.map((r, idx) => {
    const bgStyle = idx % 2 === 1 ? altRowStyle : '';
    const studentName = r.userName || r.user_name || r.studentName || '—';
    const isComp = r.isCompetition || r.is_competition;
    const pct = Math.round((r.score / (r.total || 1)) * 100);
    const dateStr = (r.date || r.created_at || '').split('T')[0].replace(/-/g, '/');
    const timeStr = r.timeFormatted || r.time_formatted || (r.timeSeconds ? `${r.timeSeconds} ث` : '—');
    const levelDisplay = r.levelName || r.level_name || '—';
    const catDisplay = r.categoryName || r.category_name || '—';

    return `<tr style="${bgStyle}">
      <td style="${rowCellStyle}">${idx + 1}</td>
      <td style="${rowCellStyle} font-weight:800; color:#1e3a8a; text-align:right; padding-right:8px;">${studentName}</td>
      <td style="${rowCellStyle}">${isComp ? 'مسابقة 🏆' : 'تدريب 📝'}</td>
      <td style="${rowCellStyle}">${levelDisplay}</td>
      <td style="${rowCellStyle} font-size:8.5pt; color:#475569;">${catDisplay}</td>
      <td style="${rowCellStyle} font-weight:bold; color:#CC0000;">${r.score} / ${r.total}</td>
      <td style="${rowCellStyle} color:${pct >= 70 ? '#166534' : pct >= 50 ? '#92400e' : '#991b1b'}; font-weight:bold;">${pct}%</td>
      <td style="${rowCellStyle}">${timeStr}</td>
      <td style="${rowCellStyle} color:#64748b;">${dateStr}</td>
    </tr>`;
  }).join('');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>كشف طلبة المدرب ${coachName}</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>90</w:Zoom>
    <w:DocumentKind>DocumentIntranet</w:DocumentKind>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: A4 landscape; margin: 1.2cm; }
  body {
    font-family: 'Arial', 'Traditional Arabic', 'Simplified Arabic', sans-serif;
    direction: rtl;
    text-align: right;
    margin: 0;
    padding: 0;
    font-size: 10pt;
  }
  table { border-collapse: collapse; width: 100%; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  td, th { mso-line-height-rule: exactly; }
  .section-title {
    background: linear-gradient(135deg, #1e3a8a, #2563eb);
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13pt;
    font-weight: bold;
    margin: 20px 0 10px 0;
    text-align: center;
  }
</style>
</head>
<body dir="rtl">

<!-- HEADER -->
<table width="100%" style="border:none; margin-bottom:14px; border-bottom: 3px solid #1e3a8a; padding-bottom:10px;">
  <tr>
    ${buildLogoCell(logoSrc, 'right')}
    <td align="center" style="border:none; vertical-align:middle;">
      <p style="margin:2px 0; font-size:18pt; font-weight:900; color:#1e3a8a;">
        كشف طلبة المدرب — coach souiher nedjma
      </p>
      <p style="margin:2px 0; font-size:13pt; font-weight:bold; color:#2563eb;">
        المدرب: ${coachName}
      </p>
      <p style="margin:2px 0; font-size:10pt; color:#64748b;">
        تاريخ الإصدار: ${reportDate} &nbsp;|&nbsp; عدد الطلاب: ${students.length} &nbsp;|&nbsp; عدد الاختبارات: ${results.length}
      </p>
    </td>
    ${buildLogoCell(logoSrc, 'left')}
  </tr>
</table>

<!-- SECTION 1: STUDENTS LIST -->
<p class="section-title">📋 قائمة الطلاب الشاملة (${students.length} طالب)</p>

<table width="100%" style="border:1px solid #cbd5e1; margin-bottom:24px;">
  <thead>
    <tr>
      <th style="${headerCellStyle}">#</th>
      <th style="${headerCellStyle}">اسم الطالب</th>
      <th style="${headerCellStyle}">العمر</th>
      <th style="${headerCellStyle}">سنة الميلاد</th>
      <th style="${headerCellStyle}">البلد / الولاية</th>
      <th style="${headerCellStyle}">المستوى</th>
      <th style="${headerCellStyle}">عدد الاختبارات</th>
      <th style="${headerCellStyle}">متوسط النسبة</th>
      <th style="${headerCellStyle}">تاريخ التسجيل</th>
    </tr>
  </thead>
  <tbody>
    ${studentsRowsHtml || `<tr><td colspan="9" style="${rowCellStyle} color:#94a3b8;">لا يوجد طلاب مسجلون</td></tr>`}
  </tbody>
</table>

<!-- SECTION 2: ALL RESULTS -->
<p class="section-title">📊 سجل جميع النتائج والاختبارات (${results.length} نتيجة)</p>

<table width="100%" style="border:1px solid #cbd5e1;">
  <thead>
    <tr>
      <th style="${headerCellStyle}">#</th>
      <th style="${headerCellStyle}">اسم الطالب</th>
      <th style="${headerCellStyle}">نوع</th>
      <th style="${headerCellStyle}">المستوى</th>
      <th style="${headerCellStyle}">الفئة / السن</th>
      <th style="${headerCellStyle}">الدرجة</th>
      <th style="${headerCellStyle}">النسبة</th>
      <th style="${headerCellStyle}">الوقت</th>
      <th style="${headerCellStyle}">التاريخ</th>
    </tr>
  </thead>
  <tbody>
    ${resultsRowsHtml || `<tr><td colspan="9" style="${rowCellStyle} color:#94a3b8;">لا توجد نتائج مسجلة</td></tr>`}
  </tbody>
</table>

<p style="text-align:center; color:#94a3b8; font-size:9pt; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:10px;">
  جميع الحقوق محفوظة © 2026 coach souiher nedjma &nbsp;|&nbsp; Coach.souihernedjma@gmail.com &nbsp;|&nbsp; +213 664 159 368
</p>

</body>
</html>`;
}

/**
 * Universal Word Document Downloader
 * Uses Blob with UTF-8 BOM to prevent character corruption and avoid browser URL length limits
 */
export function downloadWordDocument(html, filename) {
  try {
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const fileDownload = document.createElement('a');
    fileDownload.href = url;
    fileDownload.download = filename;
    document.body.appendChild(fileDownload);
    fileDownload.click();
    setTimeout(() => {
      document.body.removeChild(fileDownload);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (e) {
    // Fallback if Blob fails
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const fileDownload = document.createElement('a');
    fileDownload.href = source;
    fileDownload.download = filename;
    document.body.appendChild(fileDownload);
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }
}
