/**
 * 백엔드 TarotDataInitializer 기준 테마 ID
 * 1=연애(LOVE, 전용 API), 2~7=월간 테마(POST /themes/monthly), 8=오늘(TODAY, GET /themes/daily)
 */
export const MONTHLY_THEMES = [
  { id: 2, name: '직업운', description: '취업·이직·커리어 흐름' },
  { id: 3, name: '성공운', description: '목표 달성·성과·성장' },
  { id: 4, name: '학업운', description: '시험·공부·학업·합격' },
  { id: 5, name: '재물운', description: '수입·저축·투자·금전' },
  { id: 6, name: '건강운', description: '몸과 마음의 에너지' },
  { id: 7, name: '관계운', description: '인간관계·소통·인맥' },
] as const

export type MonthlyThemeId = (typeof MONTHLY_THEMES)[number]['id']
