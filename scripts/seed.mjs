import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config({ path: ".env.local" });
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
  try {
    const { default: dbConnect } = await import("../src/app/lib/db.js");
    const { default: Admin } = await import("../src/app/lib/models/Admin.js");
    
    await dbConnect();
    
    console.log("=== Admin User Setup ===");
    const email = await askQuestion("Enter admin email: ");
    const password = await askQuestion("Enter admin password: ");

    if (!email || !password) {
      console.log("❌ Email and password are required.");
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne({ email });
    if (!existing) {
      await Admin.create({ email, password: hashed });
      console.log(`✅ Admin user created successfully: ${email}`);
    } else {
      await Admin.findByIdAndUpdate(existing._id, { password: hashed });
      console.log(`✅ Admin exists. Password updated successfully for: ${email}`);
    }
  } catch (err) {
    console.error("❌ Error setting up admin:", err);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
