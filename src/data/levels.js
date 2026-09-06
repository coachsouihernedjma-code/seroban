export const levelsData = {
  algerian: [
    {
      id: 'prep',
      name: 'المستوى التحضيري',
      color: '#48d1cc',
      categories: [
        {
          id: 'prep-1',
          ageGroup: 'مواليد (2019-2020-2021)',
          minYear: 2019,
          maxYear: 2021,
          ageMin: 5,
          ageMax: 7,
          details: '7 جداول آحاد (3 إلى 5 طوابق) | توقيت 7 دقائق',
          config: { count: 90, ops: 5, type: 'units_only' }
        }
      ]
    },
    {
      id: 'level-1',
      name: 'المستوى الأول',
      color: '#20b2aa',
      categories: [
        {
          id: 'l1-1',
          ageGroup: 'ف1 (2017-2018)',
          minYear: 2017,
          maxYear: 2018,
          ageMin: 8,
          ageMax: 9,
          details: '6 آحاد، 3 عشرات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 110, ops: 6, type: 'tens_easy' }
        },
        {
          id: 'l1-2',
          ageGroup: 'ف2 (2015-2016)',
          minYear: 2015,
          maxYear: 2016,
          ageMin: 10,
          ageMax: 11,
          details: '6 آحاد، 5 عشرات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 120, ops: 6, type: 'tens_medium' }
        },
        {
          id: 'l1-3',
          ageGroup: 'ف3 (2013-2014)',
          minYear: 2013,
          maxYear: 2014,
          ageMin: 12,
          ageMax: 13,
          details: '6 آحاد، 6 عشرات، 1 مئات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 130, ops: 6, type: 'tens_hard' }
        },
        {
          id: 'l1-4',
          ageGroup: 'ف4 (2010-2011-2012)',
          minYear: 2010,
          maxYear: 2012,
          ageMin: 14,
          ageMax: 16,
          details: '7 آحاد، 7 عشرات، 1 مئات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 150, ops: 6, type: 'tens_expert' }
        }
      ]
    },
    {
      id: 'level-2',
      name: 'المستوى الثاني (قاعدة +5)',
      color: '#008b8b',
      categories: [
        {
          id: 'l2-1',
          ageGroup: 'ف1 (2014-2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          details: '7 آحاد، 5 عشرات، 1 مئات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 130, ops: 6, type: 'rule_5' }
        },
        {
          id: 'l2-2',
          ageGroup: 'ف2 (2008-2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          details: '7 آحاد، 6 عشرات، 2 مئات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 150, ops: 6, type: 'rule_5' }
        }
      ]
    },
    {
      id: 'level-3',
      name: 'المستوى الثالث (قاعدة +10)',
      color: '#d4af37',
      categories: [
        {
          id: 'l3-1',
          ageGroup: 'ف1 (2014-2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          details: '7 آحاد، 5 عشرات، 1 مئات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 130, ops: 6, type: 'rule_10' }
        },
        {
          id: 'l3-2',
          ageGroup: 'ف2 (2008-2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          details: '7 آحاد، 6 عشرات، 2 مئات (3 إلى 6 طوابق) | 7 دقائق',
          config: { count: 150, ops: 6, type: 'rule_10' }
        }
      ]
    },
    {
      id: 'level-4',
      name: 'المستوى الرابع (مختلط)',
      color: '#e74c3c',
      categories: [
        {
          id: 'l4-1',
          ageGroup: 'الفئة الأولى (2014-2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          details: '40 ضرب (رقم×رقمين)، 40 (رقم×3أرقام)، 20 (رقمين×رقمين)، 20 مركب آحاد، 10 مركب عشرات',
          config: { count: 130, ops: 6, type: 'mixed_1' }
        },
        {
          id: 'l4-2',
          ageGroup: 'الفئة الثانية (2008-2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          details: '40 ضرب (رقم×رقمين)، 40 (رقم×3أرقام)، 30 (رقمين×رقمين)، 20 مركب آحاد، 20 مركب عشرات',
          config: { count: 150, ops: 6, type: 'mixed_2' }
        }
      ]
    }
  ],
  international: [
    {
      id: 'int-beginner',
      name: 'المستوى التمهيدي (Beginner)',
      color: '#48d1cc',
      categories: [
        { id: 'int-beg-1', ageGroup: 'مواليد (2019-2021)', minYear: 2019, maxYear: 2021, ageMin: 5, ageMax: 7, details: '7 عمليات، أحاد فقط', config: { count: 90, ops: 7, type: 'units_only' } }
      ]
    },
    {
      id: 'int-intermediate',
      name: 'المستوى المتوسط (Intermediate)',
      color: '#20b2aa',
      categories: [
        { id: 'int-int-1', ageGroup: 'مواليد (2015-2018)', minYear: 2015, maxYear: 2018, ageMin: 8, ageMax: 11, details: '6 عمليات، آحاد وعشرات', config: { count: 120, ops: 6, type: 'tens_medium' } },
        { id: 'int-int-2', ageGroup: 'مواليد (2010-2014)', minYear: 2010, maxYear: 2014, ageMin: 12, ageMax: 16, details: '6 عمليات، آحاد وعشرات (متقدم)', config: { count: 140, ops: 6, type: 'tens_hard' } }
      ]
    },
    {
      id: 'int-advanced',
      name: 'المستوى المتقدم (Advanced)',
      color: '#d4af37',
      categories: [
        { id: 'int-adv-1', ageGroup: 'مواليد (2014-2019)', minYear: 2014, maxYear: 2019, ageMin: 7, ageMax: 12, details: 'قاعدة الـ5 والـ10', config: { count: 130, ops: 6, type: 'rule_10' } },
        { id: 'int-adv-2', ageGroup: 'مواليد (2008-2013)', minYear: 2008, maxYear: 2013, ageMin: 13, ageMax: 18, details: 'قاعدة الـ5 والـ10 (متقدم)', config: { count: 150, ops: 7, type: 'rule_10' } }
      ]
    },
    {
      id: 'int-champion',
      name: 'مستوى البطولة (Grand Master)',
      color: '#e74c3c',
      categories: [
        { id: 'int-cha-1', ageGroup: 'مواليد (2014-2019)', minYear: 2014, maxYear: 2019, ageMin: 7, ageMax: 12, details: 'عمليات مركّبة ومتنوعة', config: { count: 130, type: 'mixed_1' } },
        { id: 'int-cha-2', ageGroup: 'مواليد (2008-2013)', minYear: 2008, maxYear: 2013, ageMin: 13, ageMax: 18, details: 'عمليات مركّبة ومتنوعة (صعبة)', config: { count: 150, type: 'mixed_2' } }
      ]
    }
  ]
};

/**
 * Given a user's age or birth year and the current system, returns the filtered levels
 * showing only the matching category per level.
 */
export function getFilteredLevels(system, ageOrYear) {
  const levels = levelsData[system] || [];
  const val = Number(ageOrYear);
  const currentYear = 2026;
  const age = val > 1900 ? (currentYear - val) : val;
  const birthYear = val > 1900 ? val : (currentYear - val);

  return levels.reduce((acc, level) => {
    const matchingCat = level.categories.find(cat => {
      if (cat.minYear && cat.maxYear && birthYear >= cat.minYear && birthYear <= cat.maxYear) {
        return true;
      }
      return age >= cat.ageMin && age <= cat.ageMax;
    });
    if (matchingCat) {
      acc.push({ ...level, matchedCategory: matchingCat });
    }
    return acc;
  }, []);
}

