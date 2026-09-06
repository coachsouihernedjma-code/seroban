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
  for (const [key, val] of Object.entries(ARABIC_ORDINALS)) {
    if (levelName.includes(key)) return val;
  }
  return '1';
}

function getCategoryNum(result) {
  const match = result.categoryId?.match(/-(\d+)$/);
  return match ? match[1] : '1';
}

function getCategoryBirthYear(categoryName) {
  const year4 = categoryName.match(/(20\d{2})/);
  if (year4) return parseInt(year4[1], 10);
  const match = categoryName.match(/(\d{2})-(\d{2})/);
  if (match) {
    return new Date().getFullYear() - parseInt(match[2], 10);
  }
  return new Date().getFullYear() - 8;
}


function formatCompetitionDate(isoString) {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
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

export async function generateResultsWordDocument(sortedResults, users) {
  const logoSrc = await fetchLogoBase64();
  const firstResult = sortedResults[0];
  const levelNum = getLevelNum(firstResult.levelName);
  const categoryNum = getCategoryNum(firstResult);
  const birthYear = getCategoryBirthYear(firstResult.categoryName);
  const competitionDate = formatCompetitionDate(firstResult.date);

  const getUser = (userId) => users.find((u) => u.id === userId) || {};

  const cellStyle = 'background-color:#F5E0ED; border:1px solid #000; text-align:center; padding:6px 4px; font-size:11pt;';
  const emptyCell = `<td style="${cellStyle}">&nbsp;</td>`;

  const rowsHtml = sortedResults.map((r, index) => {
    const user = getUser(r.userId);
    return `
      <tr>
        <td style="${cellStyle}">${index + 1}</td>
        <td style="${cellStyle}">${user.name || ''}</td>
        ${emptyCell}
        ${emptyCell}
        ${emptyCell}
        <td style="${cellStyle} color:#CC0000; font-weight:bold;">${r.score}ع / ${r.total}ع</td>
        ${emptyCell}
        ${emptyCell}
        ${emptyCell}
        ${emptyCell}
      </tr>
    `;
  }).join('');

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>قائمة الأبطال المتأهلين</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page { size: A4; margin: 1.5cm; }
  body {
    font-family: 'Arial', 'Traditional Arabic', 'Simplified Arabic', sans-serif;
    direction: rtl;
    text-align: center;
    margin: 0;
    padding: 0;
  }
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  td, th { mso-line-height-rule: exactly; }
</style>
</head>
<body dir="rtl">

<table width="100%" style="border:none; margin-bottom:10px;">
  <tr>
    ${buildLogoCell(logoSrc, 'right')}
    <td width="76%" align="center" style="border:none; vertical-align:middle;">
      <p style="margin:4px 0; font-size:16pt; font-weight:bold; color:#1a3a8f;">
        قائمة الأبطال المتأهلين للمسابقة العربية ${getArabicMonthYear()}
      </p>
      <p style="margin:4px 0; font-size:14pt; font-weight:bold; color:#CC0000;">
        مسابقة قسنطينة يوم ${competitionDate}
      </p>
      <p style="margin:4px 0; font-size:13pt; font-weight:bold; color:#000;">
        م ${levelNum} ف ${categoryNum} - ${birthYear}
      </p>
    </td>
    ${buildLogoCell(logoSrc, 'left')}
  </tr>
</table>

<table width="100%" style="border:1px solid #000; margin-top:15px;">
  <thead>
    <tr>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">الرقم</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">الإسم و اللقب</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">تاريخ الميلاد</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">المستوى</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">الفئة</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">ع ع ص</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">التوقيت</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">المركز</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">إسم المدرب</th>
      <th style="background-color:#D4A5C9; border:1px solid #000; text-align:center; padding:8px 4px; font-size:11pt; font-weight:bold; color:#000;">الولاية</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
</table>

</body>
</html>`;
}

export function downloadWordDocument(html, filename) {
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
  const fileDownload = document.createElement('a');
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download = filename;
  fileDownload.click();
  document.body.removeChild(fileDownload);
}
