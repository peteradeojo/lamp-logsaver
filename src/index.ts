import mysql from 'mysql2';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
	dotenv.config();
}

import { formatDate, Cache, Database } from './lib/index';

type Log = {
	app: {
		id: number;
	};
	text: string;
	ip: string;
	saved: boolean;
	context: { [key: string]: string };
	level: string;
	createdAt?: string;
};

const fetchLogs = async (skip: number, count: number) => {};

(async () => {
	try {
		const db = await new Database().getClient();
		const cache = new Cache().getClient()!;
		// await cache.connect();

		let cursor = '0';
		let elements = [];

		let sql =
			'INSERT INTO logs (appId, ip, text, level, saved, createdAt) VALUES ';
		let queries = [];

		let extracted: string[] = [];

		while (true) {
			[cursor, elements] = await cache.hscan(
				'log-prewrite:1',
				cursor,
				'COUNT',
				500,
				(err, result) => {
					if (err) {
						console.error(err);
						return;
					}
				}
			);

			for (let i = 0; i < elements.length; i += 2) {
				const log: Log = JSON.parse(elements[i + 1]);
				log.createdAt ??= formatDate(new Date());
				extracted.push(elements[i]);
				queries.push(
					`('${log.app.id}', '${log.ip}', '${log.text}', '${log.level}', 0, '${log.createdAt}')`
				);
			}

			if (cursor == '0') {
				if (queries.length > 0) {
					const execQuery = sql + queries.join(',');
					console.log(execQuery);
					const result = await db!.query(execQuery);
					console.log(result);
					queries = [];
					await cache.hdel('log-prewrite:1', ...extracted);
					extracted = [];
				}

				db!.destroy();
				cache.disconnect();
				break;
			}
		}

		process.exit();
	} catch (error) {
		console.error(error);
	} finally {
		process.exit();
	}
})();
