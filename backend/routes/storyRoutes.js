import express from 'express';
import Story from '../models/Story.js';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const router = express.Router();

// Initialize Nebius client
const client = new OpenAI({
    baseURL: 'https://api.studio.nebius.com/v1/',
    apiKey: process.env.NEBIUS_API_KEY,
});

router.post("/generate-story", async (req, res) => {
    try {
        const { prompt, ageCategory, genre, wordCount } = req.body;

        const wordLengthMap = { short: 300, medium: 500, long: 1000 };
        const targetWordCount = wordLengthMap[wordCount] || 800;

        const ageCategoryDescription = {
            children: "suitable for children ages 3-8, with simple language and positive themes",
            "middle-grade": "suitable for children ages 9-12, with age-appropriate themes and some complexity",
            "young-adult": "suitable for teenagers ages 13-17, with more complex themes and character development",
            adult: "suitable for adults 18+, with mature themes and complex narratives",
            all: "suitable for readers of all ages, with universal themes",
        };
        const ageDescription = ageCategoryDescription[ageCategory] || ageCategoryDescription.all;

        const systemPrompt = "You are a creative storyteller who writes engaging stories in various genres.";
        const userPrompt = `Write a ${genre} story based on this prompt: "${prompt}". The story should be ${ageDescription} and approximately ${targetWordCount} words long.`;

        // Send request to Nebius API
        const response = await client.chat.completions.create({
            model: "meta-llama/Meta-Llama-3.1-70B-Instruct-fast",
            max_tokens: 512,
            temperature: 0.6,
            top_p: 0.9,
            extra_body: { top_k: 50 },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        // Extract response
        const storyText = response.choices[0]?.message?.content?.trim();
        if (!storyText) {
            throw new Error("Failed to generate story from Nebius.");
        }

        // Create a new story entry
        const story = new Story({
            title: "Generated Story",
            content: storyText,
            prompt,
            ageCategory,
            genre,
            wordCount,
        });

        await story.save();
        console.log("Story generated successfully.", story);
        return res.json({ title: "Generated Story", story: storyText });

    } catch (err) {
        console.error("Error generating story: ", err);
        return res.status(500).json({ message: "Failed to generate story" });
    }
});

export default router;
