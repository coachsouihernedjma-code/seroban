import { levelsData } from '../data/levels';

export const COMPETITIONS_KEY = 'soroban_competitions';

export function getCompetitions() {
  return JSON.parse(localStorage.getItem(COMPETITIONS_KEY) || '[]');
}

export function saveCompetitions(competitions) {
  localStorage.setItem(COMPETITIONS_KEY, JSON.stringify(competitions));
}

export function getCompetitionStatus(competition) {
  const now = new Date();
  const openDate = new Date(competition.openDate);
  if (now < openDate) return 'upcoming';
  if (competition.closeDate && now > new Date(competition.closeDate)) return 'closed';
  return 'open';
}

export function isCompetitionOpen(competition) {
  return getCompetitionStatus(competition) === 'open';
}

export function hasUserParticipated(competitionId, userId) {
  const results = JSON.parse(localStorage.getItem('soroban_results') || '[]');
  return results.some(
    (r) => r.isCompetition && r.competitionId === competitionId && r.userId === userId
  );
}

export function getLevelCategory(system, levelId, categoryId) {
  const level = levelsData[system]?.find((l) => l.id === levelId);
  if (!level) return null;
  const category = level.categories.find((c) => c.id === categoryId);
  if (!category) return null;
  return { level, category };
}

export function getCompetitionsForUser(system, age) {
  return getCompetitions()
    .filter((c) => c.system === system)
    .map((competition) => {
      const match = getLevelCategory(competition.system, competition.levelId, competition.categoryId);
      if (!match) return null;
      const { level, category } = match;
      if (age < category.ageMin || age > category.ageMax) return null;
      return {
        ...competition,
        status: getCompetitionStatus(competition),
        level,
        category,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.openDate) - new Date(b.openDate));
}

export function formatCompetitionDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDatetimeLocalValue(isoString) {
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
