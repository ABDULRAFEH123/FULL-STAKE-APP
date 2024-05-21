import mongoose from "mongoose";
import dotenv from "dotenv";

// THIS IS A SCRIPT NAME [detenv] that is used to update the old
//  and new records as required ok..(if we wants to add the new field in any record oin db)

dotenv.config();

// Define the schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "", // You can set a default value here if desired
    },
    about: {
      type: String,
      default: "", // You can set a default value here if desired
    },
    subscription: {
      active: { type: Boolean, default: false },
      planId: { type: String, default: null },  // Stores the Stripe plan ID
    },
    otp: String,
    otpExpiry: Date,
    
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
async function normalizeSubscriptionField() {
  try {
    const result = await User.updateMany(
      { "subscription": { $type: "bool" } }, // filter documents where `subscription` is a boolean
      {
        $set: {
          "subscription": {
            "active": false, // default value
            "planId": null   // default value
          }
        }
      }
    );
    console.log('Normalized subscription fields:', result);
  } catch (error) {
    console.error("Error normalizing subscription fields:", error);
  }
}

// Function to update all users
async function addFieldsToUsers() {
  await normalizeSubscriptionField(); // Ensure all documents are normalized
  try {
    const result = await User.updateMany(
  
 
      {
        $set: {
          location: "",
          about: "",
          "subscription.active": true,   // Set active to true, indicating subscription is active
          "subscription.planId": priceId // Set planId to the Stripe price ID
        },
      },
      { upsert: false, multi: true }
    );
    // console.log('Result:', result);
    // console.log(`${result.nModified} users updated successfully`);
  } catch (error) {
    console.error("Error updating users:", error);
  }
}

// Export the model and any additional functions
export { User, connectMongoDB, addFieldsToUsers };

// Run updates when file is loaded
(async () => {
  await connectMongoDB();
  await addFieldsToUsers();
})();
