declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string;
			DATA_BASE_URI: string;
		}
	}
	namespace Express {
		interface Response {
		  success<T>(data?: T): void;
		  error(message: string): void;
		}
		interface Request {
		}
	  }
}
export {}