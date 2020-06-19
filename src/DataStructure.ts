export interface ShredderInputData {
  title: string
  speedRatings: InputRatings
  torqueRatings: InputRatings
}

export interface InputData {
  shredders: ShredderInputData[]
}

export interface InputRatings {
  tooLow: number
  low: number
  good: number
  high: number
  tooHigh: number
}

export class RatingResult {
  title: string
  value: number
  constructor(title: string, value: number) {
    this.title = title
    this.value = value
  }
}

const InputRatingsOrder: string[] = [
  "tooLow",
  "low",
  "good",
  "high",
  "tooHigh"
]

const RatingResultMap = {
  tooLow: new RatingResult("Too Low", 1),
  low: new RatingResult("Low", 2),
  good: new RatingResult("Good", 3),
  high: new RatingResult("High", 4),
  tooHigh: new RatingResult("Too High", 5)
};

export function getRating(ratings: InputRatings, value: number): RatingResult | null {
  let finalRating: RatingResult | null = null
  for(let i = 0; i < InputRatingsOrder.length; i++) {
    let rating = (ratings as any)[InputRatingsOrder[i]] as number
    if (value >= rating) {
      finalRating = getRatingResult(InputRatingsOrder[i])
    }
  }
  return finalRating
}

function getRatingResult(rating: string): RatingResult | null {
  switch (rating) {
    case "tooLow":
      return RatingResultMap.tooLow
    case "low":
      return RatingResultMap.low
    case "good":
      return RatingResultMap.good
    case "high":
      return RatingResultMap.high
    case "tooHigh":
      return RatingResultMap.tooHigh
  }
  return null
}