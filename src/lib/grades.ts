import { CATEGORY_WEIGHTS, type Grade, type GradeCategory } from '@/types'

const CATEGORIES = Object.keys(CATEGORY_WEIGHTS) as GradeCategory[]

// Weighted average across categories. Each category averages its own scores;
// categories with no grades are dropped and remaining weights are renormalized
// so a student isn't penalized for assignments that haven't been given yet.
export function calculateWeightedAverage(grades: Grade[]): number | null {
  if (grades.length === 0) return null

  let weightedSum = 0
  let weightTotal = 0

  for (const category of CATEGORIES) {
    const inCat = grades.filter((g) => g.category === category)
    if (inCat.length === 0) continue
    const avg = inCat.reduce((sum, g) => sum + g.score, 0) / inCat.length
    weightedSum += avg * CATEGORY_WEIGHTS[category]
    weightTotal += CATEGORY_WEIGHTS[category]
  }

  if (weightTotal === 0) return null
  return weightedSum / weightTotal
}

export function letterGradeFor(score: number | null): string | null {
  if (score === null) return null
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function classAverageFrom(studentAverages: (number | null)[]): number | null {
  const valid = studentAverages.filter((s): s is number => s !== null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}
