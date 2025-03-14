import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        email: {
            type: String,
            unique: [true, "Email already exists"],
            required: [true, "Email is required"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
        },
        image: {
            type: String,
        },
        ModelUsed: {
            type: Schema.Types.ObjectId,
            ref: "Property",
        },
    },
    {
        timestamps: true,
        collection: "argosdb1", // Specify collection name properly inside options
    }
);

// Ensure the model is not recompiled in Next.js
const User = models.argos || model("argos", UserSchema);
export default User;
