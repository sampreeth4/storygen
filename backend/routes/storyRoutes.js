import express, { text } from 'express';
import Story from '../models/Story.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
console.log("Using OpenAI Key:", process.env.OPENAI_API_KEY);

router.post("/generate-story", async (req,res) => {
    try{
        const {prompt, ageCategory, genre, wordCount} = req.body;

        const wordLengthMap = {
            short: 300,
            medium: 500,
            long: 1000
        }

        const ageCategoryDescription = {
            children: "suitable for children ages 3-8, with simple language and positive themes",
            "middle-grade": "suitable for children ages 9-12, with age-appropriate themes and some complexity",
            "young-adult": "suitable for teenagers ages 13-17, with more complex themes and character development",
            adult: "suitable for adults 18+, with mature themes and complex narratives",
            all: "suitable for readers of all ages, with universal themes",            
        }
        const targetWordCount = wordLengthMap[wordCount] || 800;
        const ageDescription = ageCategoryDescription[ageCategory] || ageCategoryDescription.all;

        const openAIPrompt = `
      Write a ${genre} story based on the following prompt: "${prompt}".
      
      The story should be ${ageDescription}.
      
      Please make the story approximately ${targetWordCount} words long.
      
      Format the response as a JSON object with two fields:
      1. "title": A creative and engaging title for the story
      2. "story": The full story content with proper paragraphs
    `;
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                  role: "system",
                  content:
                    "You are a creative storyteller who writes engaging stories in various genres and for different age groups.",
                },
                {
                  role: "user",
                  content: openAIPrompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 2000,
        }),
    })
    if(!openAiResponse.ok){
        const errorData = await openAiResponse.json();
        console.error("OpenAI API error:", errorData);
        throw new Error("Failed to generate story from OpenAI");
    }

    const openaiData = await openAiResponse.json();
    let storyData
    try{
        const responseText = openaiData.choices[0].message.content.trim();
        storyData = JSON.parse(responseText);
    }catch(err){
        const responseText = openaiData.choices[0].message.content.trim();
        const titleMatch = responseText.match(/title["\s:]+([^"]+)/i)
        const title = titleMatch ? titleMatch[1].trim() : "Generated Story"
  
        let story = responseText.replace(/["{}[\]]/g, "")
        story = story.replace(/title[^,]+,/i, "")
        story = story.replace(/story[":]+/i, "")
        story = story.trim()
  
        storyData = { title, story }
    }
    const story = new Story({
        title: storyData.title,
        content: storyData.story,
        prompt,
        ageCategory,
        genre,
        wordCount,
      })
  
      await story.save()
  
      return res.json({
        title: storyData.title,
        story: storyData.story,
    })

    }catch(err){
        console.error("Error generating story: ", err);
        return res.status(500).json({message: "Failed to generate story"});
    }
})

export default router;