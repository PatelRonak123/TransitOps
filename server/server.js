import app from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase } from "./config/dbConfig.js";

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server is running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
});
