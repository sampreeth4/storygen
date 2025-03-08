import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    title: String,
    content: String,
    prompt: String,
    ageCategory: String,
    genre: String,
    wordCount: String,
    createdAt:{
        type: Date,
        default: Date.now
    },
})

const Story = mongoose.model("Story", storySchema);
export default Story;