import { Cache, Database } from './database';

export const sleep = (ms: number) => {
	const tm = new Date().getTime() + ms;
	while (new Date().getTime() < tm) {}
	return;
};

export function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	const milliseconds = String(date.getMilliseconds()).padStart(6, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export { Cache, Database };
