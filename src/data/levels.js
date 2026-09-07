export const levelsData = {
  algerian: [
    {
      id: 'prep',
      name: 'المستوى التحضيري',
      color: '#10b981',
      badge: '🌱 التحضيري',
      categories: [
        {
          id: 'prep-1',
          ageGroup: 'مواليد (2019 - 2020 - 2021)',
          minYear: 2019,
          maxYear: 2021,
          ageMin: 5,
          ageMax: 7,
          operationsCount: 90,
          tables: { units: 7, tens: '/', hundreds: '/' },
          tablesSummary: '7 جداول آحاد فقط',
          floorsText: 'ثلاثة إلى خمسة',
          floorsRange: '3 - 5',
          floorsMin: 3,
          floorsMax: 5,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 جداول آحاد (3 إلى 5 طوابق) | 90 عملية | 07 دقائق',
          config: { count: 90, floorsMin: 3, floorsMax: 5, ops: 4, type: 'units_only', maxDigits: 1 }
        }
      ]
    },
    {
      id: 'level-1',
      name: 'المستوى الأول',
      color: '#f59e0b',
      badge: '⭐ المستوى الأول',
      categories: [
        {
          id: 'l1-1',
          ageGroup: 'ف1 (2017 - 2018)',
          minYear: 2017,
          maxYear: 2018,
          ageMin: 8,
          ageMax: 9,
          operationsCount: 110,
          tables: { units: 6, tens: 3, hundreds: '/' },
          tablesSummary: '6 جداول آحاد، 3 جداول عشرات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '6 آحاد، 3 عشرات (3 إلى 6 طوابق) | 110 عملية | 07 دقائق',
          config: { count: 110, floorsMin: 3, floorsMax: 6, ops: 5, type: 'tens_easy' }
        },
        {
          id: 'l1-2',
          ageGroup: 'ف2 (2015 - 2016)',
          minYear: 2015,
          maxYear: 2016,
          ageMin: 10,
          ageMax: 11,
          operationsCount: 120,
          tables: { units: 6, tens: 5, hundreds: '/' },
          tablesSummary: '6 جداول آحاد، 5 جداول عشرات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '6 آحاد، 5 عشرات (3 إلى 6 طوابق) | 120 عملية | 07 دقائق',
          config: { count: 120, floorsMin: 3, floorsMax: 6, ops: 5, type: 'tens_medium' }
        },
        {
          id: 'l1-3',
          ageGroup: 'ف3 (2013 - 2014)',
          minYear: 2013,
          maxYear: 2014,
          ageMin: 12,
          ageMax: 13,
          operationsCount: 130,
          tables: { units: 6, tens: 6, hundreds: 1 },
          tablesSummary: '6 جداول آحاد، 6 عشرات، 1 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '6 آحاد، 6 عشرات، 1 مئات (3 إلى 6 طوابق) | 130 عملية | 07 دقائق',
          config: { count: 130, floorsMin: 3, floorsMax: 6, ops: 5, type: 'tens_hard' }
        },
        {
          id: 'l1-4',
          ageGroup: 'ف4 (2010 - 2011 - 2012)',
          minYear: 2010,
          maxYear: 2012,
          ageMin: 14,
          ageMax: 16,
          operationsCount: 150,
          tables: { units: 7, tens: 7, hundreds: 1 },
          tablesSummary: '7 جداول آحاد، 7 عشرات، 1 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 آحاد، 7 عشرات، 1 مئات (3 إلى 6 طوابق) | 150 عملية | 07 دقائق',
          config: { count: 150, floorsMin: 3, floorsMax: 6, ops: 6, type: 'tens_expert' }
        }
      ]
    },
    {
      id: 'level-2',
      name: 'المستوى الثاني (قاعدة +5)',
      color: '#0ea5e9',
      badge: '🚀 المستوى الثاني (+-5)',
      categories: [
        {
          id: 'l2-1',
          ageGroup: 'ف1 (2014 - 2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          operationsCount: 130,
          tables: { units: 7, tens: 5, hundreds: 1 },
          tablesSummary: '7 جداول آحاد، 5 عشرات، 1 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 آحاد، 5 عشرات، 1 مئات (3 إلى 6 طوابق) | 130 عملية | 07 دقائق',
          config: { count: 130, floorsMin: 3, floorsMax: 6, ops: 5, type: 'rule_5' }
        },
        {
          id: 'l2-2',
          ageGroup: 'ف2 (2008 - 2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          operationsCount: 150,
          tables: { units: 7, tens: 6, hundreds: 2 },
          tablesSummary: '7 جداول آحاد، 6 عشرات، 2 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 آحاد، 6 عشرات، 2 مئات (3 إلى 6 طوابق) | 150 عملية | 07 دقائق',
          config: { count: 150, floorsMin: 3, floorsMax: 6, ops: 6, type: 'rule_5' }
        }
      ]
    },
    {
      id: 'level-3',
      name: 'المستوى الثالث (قاعدة +10)',
      color: '#8b5cf6',
      badge: '👑 المستوى الثالث (+-10)',
      categories: [
        {
          id: 'l3-1',
          ageGroup: 'ف1 (2014 - 2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          operationsCount: 130,
          tables: { units: 7, tens: 5, hundreds: 1 },
          tablesSummary: '7 جداول آحاد، 5 عشرات، 1 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 آحاد، 5 عشرات، 1 مئات (3 إلى 6 طوابق) | 130 عملية | 07 دقائق',
          config: { count: 130, floorsMin: 3, floorsMax: 6, ops: 5, type: 'rule_10' }
        },
        {
          id: 'l3-2',
          ageGroup: 'ف2 (2008 - 2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          operationsCount: 150,
          tables: { units: 7, tens: 6, hundreds: 2 },
          tablesSummary: '7 جداول آحاد، 6 عشرات، 2 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 آحاد، 6 عشرات، 2 مئات (3 إلى 6 طوابق) | 150 عملية | 07 دقائق',
          config: { count: 150, floorsMin: 3, floorsMax: 6, ops: 6, type: 'rule_10' }
        }
      ]
    },
    {
      id: 'level-4',
      name: 'المستوى الرابع (الضرب والمركب)',
      color: '#ef4444',
      badge: '🏆 المستوى الرابع (مختلط)',
      categories: [
        {
          id: 'l4-1',
          ageGroup: 'الفئة الأولى (2014 - 2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          operationsCount: 130,
          tables: { units: '/', tens: '/', hundreds: '/' },
          tablesSummary: '40 (رقم×رقمين) | 40 (رقم×3 أرقام) | 20 (رقمين×رقمين) | 20 مركب آحاد | 10 مركب عشرات',
          specialBreakdown: [
            '40 عملية ضرب: رقم × رقمين',
            '40 عملية ضرب: رقم × 3 أرقام',
            '20 عملية ضرب: رقمين × رقمين',
            '20 عملية مركب آحاد',
            '10 عمليات مركب عشرات'
          ],
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'ضرب ومركب متنوع (3 إلى 6 طوابق) | 130 عملية | 07 دقائق',
          config: { count: 130, floorsMin: 3, floorsMax: 6, ops: 5, type: 'mixed_1' }
        },
        {
          id: 'l4-2',
          ageGroup: 'الفئة الثانية (2008 - 2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          operationsCount: 150,
          tables: { units: '/', tens: '/', hundreds: '/' },
          tablesSummary: '40 (رقم×رقمين) | 40 (رقم×3 أرقام) | 30 (رقمين×رقمين) | 20 مركب آحاد | 20 مركب عشرات',
          specialBreakdown: [
            '40 عملية ضرب: رقم × رقمين',
            '40 عملية ضرب: رقم × 3 أرقام',
            '30 عملية ضرب: رقمين × رقمين',
            '20 عملية مركب آحاد',
            '20 عمليات مركب عشرات'
          ],
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'ضرب ومركب متقدم (3 إلى 6 طوابق) | 150 عملية | 07 دقائق',
          config: { count: 150, floorsMin: 3, floorsMax: 6, ops: 6, type: 'mixed_2' }
        }
      ]
    }
  ],
  international: [
    {
      id: 'int-beginner',
      name: 'المستوى التمهيدي (Beginner)',
      color: '#10b981',
      badge: '🌱 التمهيدي',
      categories: [
        {
          id: 'int-beg-1',
          ageGroup: 'مواليد (2019 - 2021)',
          minYear: 2019,
          maxYear: 2021,
          ageMin: 5,
          ageMax: 7,
          operationsCount: 90,
          tables: { units: 7, tens: '/', hundreds: '/' },
          tablesSummary: '7 جداول آحاد فقط',
          floorsText: 'ثلاثة إلى خمسة',
          floorsRange: '3 - 5',
          floorsMin: 3,
          floorsMax: 5,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '7 جداول آحاد (3 إلى 5 طوابق) | 90 عملية',
          config: { count: 90, floorsMin: 3, floorsMax: 5, ops: 4, type: 'units_only' }
        }
      ]
    },
    {
      id: 'int-intermediate',
      name: 'المستوى المتوسط (Intermediate)',
      color: '#f59e0b',
      badge: '⭐ المتوسط',
      categories: [
        {
          id: 'int-int-1',
          ageGroup: 'مواليد (2015 - 2018)',
          minYear: 2015,
          maxYear: 2018,
          ageMin: 8,
          ageMax: 11,
          operationsCount: 120,
          tables: { units: 6, tens: 5, hundreds: '/' },
          tablesSummary: '6 جداول آحاد، 5 عشرات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: '6 عمليات، آحاد وعشرات | 120 عملية',
          config: { count: 120, floorsMin: 3, floorsMax: 6, ops: 5, type: 'tens_medium' }
        },
        {
          id: 'int-int-2',
          ageGroup: 'مواليد (2010 - 2014)',
          minYear: 2010,
          maxYear: 2014,
          ageMin: 12,
          ageMax: 16,
          operationsCount: 140,
          tables: { units: 6, tens: 6, hundreds: 1 },
          tablesSummary: '6 آحاد، 6 عشرات، 1 مئات',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'آحاد وعشرات ومئات متقدم | 140 عملية',
          config: { count: 140, floorsMin: 3, floorsMax: 6, ops: 6, type: 'tens_hard' }
        }
      ]
    },
    {
      id: 'int-advanced',
      name: 'المستوى المتقدم (Advanced)',
      color: '#8b5cf6',
      badge: '🚀 المتقدم',
      categories: [
        {
          id: 'int-adv-1',
          ageGroup: 'مواليد (2014 - 2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          operationsCount: 130,
          tables: { units: 7, tens: 5, hundreds: 1 },
          tablesSummary: 'قاعدة الـ 5 والـ 10',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'قاعدة الـ5 والـ10 | 130 عملية',
          config: { count: 130, floorsMin: 3, floorsMax: 6, ops: 5, type: 'rule_10' }
        },
        {
          id: 'int-adv-2',
          ageGroup: 'مواليد (2008 - 2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          operationsCount: 150,
          tables: { units: 7, tens: 6, hundreds: 2 },
          tablesSummary: 'قاعدة الـ 5 والـ 10 متقدم',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'قاعدة الـ5 والـ10 (متقدم) | 150 عملية',
          config: { count: 150, floorsMin: 3, floorsMax: 6, ops: 6, type: 'rule_10' }
        }
      ]
    },
    {
      id: 'int-champion',
      name: 'مستوى البطولة (Grand Master)',
      color: '#ef4444',
      badge: '👑 بطل البطولة',
      categories: [
        {
          id: 'int-cha-1',
          ageGroup: 'مواليد (2014 - 2019)',
          minYear: 2014,
          maxYear: 2019,
          ageMin: 7,
          ageMax: 12,
          operationsCount: 130,
          tables: { units: '/', tens: '/', hundreds: '/' },
          tablesSummary: 'عمليات ضرب ومركبة متنوعة',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'عمليات مركّبة ومتنوعة | 130 عملية',
          config: { count: 130, floorsMin: 3, floorsMax: 6, ops: 5, type: 'mixed_1' }
        },
        {
          id: 'int-cha-2',
          ageGroup: 'مواليد (2008 - 2013)',
          minYear: 2008,
          maxYear: 2013,
          ageMin: 13,
          ageMax: 18,
          operationsCount: 150,
          tables: { units: '/', tens: '/', hundreds: '/' },
          tablesSummary: 'عمليات ضرب ومركبة صعبة',
          floorsText: 'ثلاثة إلى ستة',
          floorsRange: '3 - 6',
          floorsMin: 3,
          floorsMax: 6,
          durationMinutes: 7,
          durationText: '07 دقائق',
          solutionMethod: 'حساب ذهني / سوروبان',
          details: 'عمليات مركّبة ومتنوعة (صعبة) | 150 عملية',
          config: { count: 150, floorsMin: 3, floorsMax: 6, ops: 6, type: 'mixed_2' }
        }
      ]
    }
  ]
};

/**
 * Given a user's birth year or age and the system, returns all levels that have a matching category.
 */
export function getFilteredLevels(system, ageOrYear) {
  const levels = levelsData[system] || [];
  const val = Number(ageOrYear) || 2019;
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

/**
 * Find all categories eligible for a specific birth year in the Algerian system
 */
export function getEligibleCategoriesForYear(birthYear) {
  const year = Number(birthYear);
  const eligible = [];
  const algerianLevels = levelsData.algerian || [];

  algerianLevels.forEach(level => {
    level.categories.forEach(cat => {
      if (year >= cat.minYear && year <= cat.maxYear) {
        eligible.push({
          levelId: level.id,
          levelName: level.name,
          color: level.color,
          badge: level.badge,
          category: cat
        });
      }
    });
  });

  return eligible;
}

/**
 * Get default level & category for a specific birth year
 * e.g., 2019/2020/2021 strictly defaults to 'المستوى التحضيري'
 */
export function getDefaultLevelForYear(birthYear) {
  const year = Number(birthYear) || 2020;
  
  // 2019, 2020, 2021 -> Strictly prep
  if (year >= 2019 && year <= 2021) {
    const prep = levelsData.algerian.find(l => l.id === 'prep');
    return {
      levelId: prep.id,
      levelName: prep.name,
      color: prep.color,
      badge: prep.badge,
      category: prep.categories[0]
    };
  }

  const eligible = getEligibleCategoriesForYear(year);
  return eligible.length > 0 ? eligible[0] : null;
}
