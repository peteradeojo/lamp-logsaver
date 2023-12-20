import { Redis } from 'ioredis';
import { createConnection, Connection } from 'mysql2/promise';

const debug = require('debug')('app:lib:database');

export class Cache {
	private redisClient: Redis | undefined;

	constructor() {
		this.connect();
	}

	private connect() {
		try {
			this.redisClient = new Redis(process.env.REDIS_URL!, {
				reconnectOnError(err) {
					// console.log(err.message);
					return true;
				},
				retryStrategy(times) {
					if (times == 20) {
						throw new Error('Unable to connect to Redis server.');
					}

					return times;
				},
				maxRetriesPerRequest: null,
				role: 'slave',
			});
		} catch (err) {
			this.redisClient = undefined;
			console.error(err);
			throw err;
		}
	}

	public getClient() {
		if (this.redisClient == undefined || this.redisClient.status != 'ready') {
			this.connect();
		}

		return this.redisClient;
	}
}

export class Database {
	private client: Connection | undefined;
	constructor() {}

	private async connect() {
		try {
			this.client = await createConnection({
				uri: process.env.MYSQL_URL!,
			});

			debug;
		} catch (err) {
			console.error(err);
		}
	}

	async getClient() {
		if (!this.client) await this.connect();

		return this.client;
	}
}
