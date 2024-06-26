import mongoose from "mongoose";
import dotenv from "dotenv";

// THIS IS A SCRIPT NAME [detenv] that is used to update the old
//  and new records as required ok..(if we wants to add the new field in any record oin db)

dotenv.config();
const subscriptionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["inactive", "pending", "active"],
    default: "inactive",
  },
  subscriptionId: { type: String, default: null },
  planId: { type: String, default: null },
  createdDate: { type: Date, default: null },
  endingDate: { type: Date, default: null },
  active: { type: Boolean, default: false },
});

// Define the schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, default: "" },
    about: { type: String, default: "" },
    otp: { type: String }, // Ensure this is defined
    otpExpiry: { type: Date }, // Ensure this is defined
    subscription: { type: subscriptionSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Ensure the model is singleton
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
// MongoDB connection function
async function connectMongoDB() {
  const MONGODB_URL = process.env.MONGODB_URL;
  // console.log("Connecting to MongoDB at:", MONGODB_URL);
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGODB_URL);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB", error);
    }
  } else {
    // console.log("Already connected to MongoDB");
  }
}

async function normalizeSubscriptionFields() {
  await connectMongoDB();

  try {
    const result = await User.updateMany(
      { subscription: { $exists: false } },
      {
        $set: {
          subscription: {
            status: "inactive",
            subscriptionId: null,
            createdDate: null,
            endingDate: null,
            active: false,
            planId: null,
          },
        },
      },
      { multi: true }
    );
    // console.log('Normalized subscription fields:', result);
  } catch (error) {
    console.error("Error normalizing subscription fields:", error);
  }
}

// Function to update all users
let fieldsInitialized = false;

async function addFieldsToUsers() {
  // so i commment some code here.. beacsue. of the issue and the issue is that when i buy
  // the subscription then this fucntion call on every ctrl+s... and this fucntion add new fields...
  // to the db due to that ..things my new data overwrite and as a result .. my old subs data lost...
  console.log("called..");
  if (!fieldsInitialized) {
    await normalizeSubscriptionFields();

    // const priceId = "not found";

    try {
      const result = await User.updateMany(
        {},
        {
          $set: {
            // location: "",
            // about: "",
            // otp: "",
            // otpExpiry: "",

            // "subscription.status": "inactive",
            // "subscription.subscriptionId": null,
            // "subscription.createdDate": null,
            // "subscription.endingDate": null,
            // "subscription.active": false,
            // "subscription.planId": priceId,
          },
        },
        { multi: true }
      );
      // console.log('Updated users:', result);

      fieldsInitialized = true; // Update flag to indicate fields are added
    } catch (error) {
      console.error("Error updating users:", error);
    }
  }
}

export { User, connectMongoDB, addFieldsToUsers };

(async () => {
  await connectMongoDB();
  await addFieldsToUsers();
})();
