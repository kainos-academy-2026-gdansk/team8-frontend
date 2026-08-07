import { mkdirSync } from "node:fs";
import path from "node:path";
import winston from "winston";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(colors);

const level = () => {
	const env = process.env.NODE_ENV || "development";
	return env === "development" ? "debug" : "warn";
};

const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`,
	),
);

const LOG_DIR = path.resolve(process.cwd(), "logs");
mkdirSync(LOG_DIR, { recursive: true });

const transports = [
	new winston.transports.Console(),
	new winston.transports.File({
		filename: path.join(LOG_DIR, "error.log"),
		level: "error",
	}),
	new winston.transports.File({ filename: path.join(LOG_DIR, "all.log") }),
];
