import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Visitor from "../models/Visitor.js";
import Entry from "../models/Entry.js";
import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";

const MODULES = [
  "users",
   "visitors",
    "entries",
  "roles",
  "dashboard",
  "department",
  "visit-purposes",
  
];

const initializeDatabase = async () => {
  try {
    // Sync database models
    console.log("🔄 Syncing database models...");
    await Role.sync({ alter: true });
    await Permission.sync({ alter: true });
    await User.sync({ force: true });
    await Visitor.sync({ alter: true });
    await Entry.sync({ force: true }); // Force recreate table to avoid alter issues
    console.log("🟢 Database synced");
  
    // Crear rol Admin
    let adminRole = await Role.findOne({
      where: { name: "Admin" },
    });

    if (!adminRole) {
      adminRole = await Role.create({
        name: "Admin",
        description: "Administrador con acceso completo al sistema",
      });

      // Crear permisos completos para todos los módulos
      const permissions = MODULES.map((module) => ({
        module,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
        role_id: adminRole.id,
      }));

      // Agregar permiso de auditoría (solo lectura)
      permissions.push({
        module: "audit",
        can_view: true,
        can_create: false,
        can_edit: false,
        can_delete: false,
        role_id: adminRole.id,
      });

      await Permission.bulkCreate(permissions);

      console.log("✅ Admin role created successfully with all permissions");
    } else {
      console.log("✅ Admin role already exists");
    }

    // Crear usuario Admin
    const existingAdmin = await User.findOne({
      where: { email: "boriscaiza04@gmail.com" },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      console.log('Creating user with email:', "boriscaiza04@gmail.com");
      const createdUser = await User.create({
        name: "Boris Caiza",
        email: "boriscaiza04@gmail.com",
        username: "boris.caiza",
        password: hashedPassword,
        role_id: adminRole.id,
        active: true,
      });
      console.log('User created:', createdUser ? createdUser.email : 'failed');

      console.log("✅ Admin user created successfully");
      console.log("📧 Email: boriscaiza04@gmail.com");
      console.log("🔑 Password: 123456");
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("\n🎉 Database initialization completed!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await sequelize.close();
  }
};

initializeDatabase();