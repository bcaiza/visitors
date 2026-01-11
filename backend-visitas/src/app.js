import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import models from "./models/indexModels.js";
import authRoutes from "./routes/authRoute.js";
import roleRoutes from "./routes/roleRoute.js";
import userRoutes from "./routes/userRoute.js";
import visitorRoutes from "./routes/visitorRoute.js";
import entryRoutes from "./routes/entryRoute.js";
import reportRoutes from "./routes/reportRoute.js";
import departmentRoute from "./routes/departmentRoute.js";
import visitPurposeRoute from "./routes/visitPurposeRoute.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const createUploadDirs = () => {
  const rootDir = path.join(__dirname, '..');
  const dirs = [
    path.join(rootDir, 'uploads'),
    path.join(rootDir, 'uploads', 'photos'),
    path.join(rootDir, 'uploads', 'documents')
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};
createUploadDirs();

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));
console.log('📸 Sirviendo archivos desde:', uploadsPath);

app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/departments", departmentRoute);
app.use("/api/visit-purposes", visitPurposeRoute);

async function syncDatabase() {
  try {
     await models.Role.sync({ alter: true });
    await models.Department.sync({ alter: true });
    await models.VisitPurpose.sync({ alter: true });
    await models.Visitor.sync({ alter: true });
    await models.Permission.sync({ alter: true });
    await models.User.sync({ alter: true });
    await models.Entry.sync({ alter: true });
    console.log('🟢 Database synced');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
}

syncDatabase();

app.get("/", (req, res) => res.send("Visitors API ready 🧁"));

export default app;