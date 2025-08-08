import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: { // woh jo subscribe kr rha hai
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    channel:{ // jis ko subscribe kr rha hai subscriber
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps: true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)