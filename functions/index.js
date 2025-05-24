// Import the Firebase Admin SDK
const admin = require("firebase-admin");
const {onRequest} = require("firebase-functions/v2/https");

// Initialize the Firebase Admin app
admin.initializeApp();

// Get a reference to the Firestore database
const db = admin.firestore();

// Example function that saves to Firestore
exports.saveImageGeneration = onRequest(async (request, response) => {
  try {
    // Assume the request body contains the data to save
    const generationRecord = request.body;

    // Add the record to the 'imageGenerations' collection
    const docRef = await db.collection("imageGenerations").add(
      generationRecord,
    );

    console.log("Document written with ID: ", docRef.id);

    response.status(200).send({
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error saving document: ", error);
    response.status(500).send("Error saving document");
  }
});

// The following is a placeholder for the generateImage function,
// you will need to replace the dummy image generation logic
// with your actual image generation implementation.
exports.generateImage = onRequest(async (request, response) => {
  try {
    const {
      sketch,
      style,
      prompt,
      width,
      height,
    } = request.body;

    // Validate required parameters
    if (!sketch || !style || !prompt || !width || !height) {
      response.status(400).send(
        "Missing required parameters: sketch, style, prompt, width, height",
      );
      return;
    }

    // Simulate image generation (replace with actual image generation logic)
    const imageUrl = `https://dummyimage.com/${width}x${height}/000/fff`;
    const generationRecord = {
      sketch,
      style,
      prompt,
      width,
      height,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("imageGenerations").add(generationRecord);

    console.log(`Document written with ID: ${docRef.id}`);

    response.status(200).send({
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error saving document: ", error);
    response.status(500).send("Error saving document");
  }
});
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore compiled files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
  },
};
