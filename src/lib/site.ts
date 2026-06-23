/** Глобальный конфиг сайта — название, описание и хелперы для страниц. */
export const site = {
	name: 'Полюс',
	description: 'Дизайнерская площадка для создания и тестирования UI/UX'
} as const;

export type SiteConfig = typeof site;

export const pageTitle = (segment?: string): string =>
	segment ? `${segment} — ${site.name}` : site.name;
