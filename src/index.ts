import "dotenv/config";
import app from "./app";
import Logger from "./lib/logger";

const portFromEnv = process.env.PORT
	? Number.parseInt(process.env.PORT, 10)
	: NaN;
const PORT = Number.isFinite(portFromEnv) ? portFromEnv : 3001;

app.listen(PORT, () => {
	Logger.info(`Server running on http://localhost:${PORT}`);
});
