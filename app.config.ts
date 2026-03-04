import type { ExpoConfig } from "expo/config";
import fs from "fs";
import path from "path";

// Type definitions
type AppVariant = "dev" | "prod";

// Check if files exist and create warnings
function checkAsset(filePath: string, assetName: string): string {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  ${assetName} not found at: ${filePath}`);

    // Create simple placeholder for icon if missing
    if (assetName === "App Icon") {
      console.log("💡 Creating simple placeholder icon...");
      try {
        const { createCanvas } = require("canvas");
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext("2d");

        // Blue background
        ctx.fillStyle = "#4F46E5";
        ctx.fillRect(0, 0, 1024, 1024);

        // White text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 200px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Oly", 512, 512);

        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(fullPath, buffer);
        console.log(`✅ Created placeholder ${filePath}`);
      } catch (error) {
        console.log(`📝 Please create ${filePath} manually`);
      }
    }
  }
  return filePath;
}

function loadEnv(variant: AppVariant): void {
  const envPath = path.resolve(__dirname, `.env.${variant}`);

  console.log(`📁 Loading environment from: ${envPath}`);

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    let loadedCount = 0;

    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const firstEqual = trimmedLine.indexOf("=");
      if (firstEqual !== -1) {
        const key = trimmedLine.substring(0, firstEqual).trim();
        const value = trimmedLine.substring(firstEqual + 1).trim();
        process.env[key] = value;
        loadedCount++;
      }
    });

    console.log(
      `✅ Loaded ${loadedCount} environment variables from .env.${variant}`,
    );
  } else {
    console.warn(`⚠️  Environment file not found: ${envPath}`);
    console.log("💡 Creating default environment...");

    // Create default .env file
    const defaultEnv =
      variant === "dev"
        ? `APP_VARIANT=dev\nAPI_URL=https://api.dev.olyapp.com`
        : `APP_VARIANT=prod\nAPI_URL=https://api.olyapp.com`;

    fs.writeFileSync(envPath, defaultEnv);
    console.log(`✅ Created ${envPath} with default values`);
  }
}

// Determine variant
function determineVariant(): AppVariant {
  const appVariant = process.env.APP_VARIANT;
  const easBuildProfile = process.env.EAS_BUILD_PROFILE;

  console.log("🔍 Determining app variant...");
  console.log(`   APP_VARIANT: ${appVariant || "(not set)"}`);
  console.log(`   EAS_BUILD_PROFILE: ${easBuildProfile || "(not set)"}`);

  let variant: AppVariant = "dev"; // Default

  if (appVariant === "prod" || easBuildProfile === "production") {
    variant = "prod";
  }

  console.log(`🎯 Selected variant: ${variant}`);
  return variant;
}

const variant: AppVariant = determineVariant();
loadEnv(variant);

console.log("🚀 Building Expo configuration...");
console.log("================================");

// Define paths
const iconPath = "./assets/images/icon.png";
const adaptiveIconPath = "./assets/images/icon.png";
const splashPath = "./assets/images/splash-icon.png";
const faviconPath = "./assets/images/favicon.png";

// Check and create assets if needed
checkAsset(iconPath, "App Icon");
checkAsset(adaptiveIconPath, "Adaptive Icon");
checkAsset(splashPath, "Splash Image");
checkAsset(faviconPath, "Favicon");

const IS_DEV = variant === "dev";

const expoConfig: ExpoConfig = {
  name: IS_DEV ? "Oly App (Dev)" : "Oly App",
  slug: "oly-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: iconPath,
  userInterfaceStyle: "light",
  scheme: IS_DEV ? "olyapp.dev" : "olyapp",
  splash: {
    image: splashPath,
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_DEV ? "com.olyapp.dev" : "com.olyapp",
    // Removed googleServicesFile since you don't have it
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      NSFaceIDUsageDescription:
        "Use Face ID to securely access your Oly App account",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: adaptiveIconPath,
      backgroundColor: "#ffffff",
    },
    package: IS_DEV ? "com.olyapp.dev" : "com.olyapp",
    // Removed googleServicesFile since you don't have it
    versionCode: 1,
  },
  web: {
    favicon: faviconPath,
  },
  extra: {
    variant,
    isDev: IS_DEV,
    apiUrl: process.env.API_URL,
    eas: {
      // ← ADD THIS
      projectId: "464325be-436e-4335-b734-63ef0a998d62", // ← Your EAS project ID
    },
  },
  // Removed owner and updates for now to keep it simple
  runtimeVersion: {
    policy: "sdkVersion",
  },
};

// Add plugins conditionally
const plugins: any[] = [];

try {
  require.resolve("expo-router");
  plugins.push("expo-router");
  console.log("✅ Added expo-router plugin");
} catch {
  console.log("ℹ️  expo-router not found, skipping");
}

try {
  require.resolve("expo-font");
  plugins.push([
    "expo-font",
    {
      fonts: ["./assets/fonts/Ubuntu-Medium.ttf"],
    },
  ]);
  console.log("✅ Added expo-font plugin");
} catch {
  console.log("ℹ️  expo-font not found, skipping");
}
try {
  require.resolve("@react-native-community/datetimepicker");
  plugins.push("@react-native-community/datetimepicker");
  console.log("✅ Added @react-native-community/datetimepicker plugin");
} catch {
  console.log("ℹ️  @react-native-community/datetimepicker not found, skipping");
}

if (plugins.length > 0) {
  expoConfig.plugins = plugins;
}

// Final log
console.log("\n✅ Expo configuration completed!");
console.log("================================");
console.log(`🏷️  App Variant: ${variant}`);
console.log(`📱 App Name: ${expoConfig.name}`);
console.log(`🌐 API URL: ${expoConfig.extra?.apiUrl || "(not set)"}`);
console.log(`📱 iOS Bundle: ${expoConfig.ios?.bundleIdentifier}`);
console.log(`🤖 Android Package: ${expoConfig.android?.package}`);
console.log(`🔌 Plugins: ${expoConfig.plugins?.length || 0} loaded`);
console.log("================================\n");

export default expoConfig;
