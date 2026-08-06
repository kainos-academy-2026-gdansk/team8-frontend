import app from "./app";
import "dotenv/config";
import Logger from "./lib/logger";

const portFromEnv = process.env.PORT
	? Number.parseInt(process.env.PORT, 10)
	: NaN;
const PORT = Number.isFinite(portFromEnv) ? portFromEnv : 3001;

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	Logger.info(`Server running on http://localhost:${PORT}`);
});
