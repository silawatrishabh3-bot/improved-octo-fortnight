import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";

// connections and listeners
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));