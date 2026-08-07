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

const fileFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`,
	),
);

const consoleFormat = winston.format.combine(
	winston.format.colorize({ all: true }),
	fileFormat,
);
const format = fileFormat;

const transports: winston.transport[] = [
	new winston.transports.Console({ format: consoleFormat }),
];

try {
	const LOG_DIR = path.resolve(process.cwd(), "logs");
	mkdirSync(LOG_DIR, { recursive: true });
	transports.push(
		new winston.transports.File({
			filename: path.join(LOG_DIR, "error.log"),
			level: "error",
			format: fileFormat,
		}),
		new winston.transports.File({
			filename: path.join(LOG_DIR, "all.log"),
			format: fileFormat,
		}),
	);
} catch {
	// Fall back to console-only logging when the filesystem is not writable.
}

const Logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
});

export default Logger;
