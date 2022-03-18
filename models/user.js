import mongoose from "mongoose"
import {Schema } from mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 20
    },
    picture: {
        type: String,
       default: '/avatar.png'
    },
    role: {
        type: [String],
        default: ["Student"],
        enum: ["Student", "Instructor","Admin"],
    },
    stripe_account_id: "",
    stripe_seller: {},
    stripeSession: {}
}, {timestamps: true})

export default mongoose.model("User", userSchema )