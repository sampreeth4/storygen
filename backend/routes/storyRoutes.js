import express from 'express';
import Story from '../models/Story.js';

const router = express.Router();

router.post("/generate-story", async (req,res) => {
    try{
        const {prompt, ageCategory, genre, wordCount} = req.body;

        const wordLengthMap = {
            short: 300,
            medium: 500,
            long: 1000
        }

        
    }catch(err){
        console.error("Error generating story: ", err);
        return res.status(500).json({message: "Failed to generate story"});
    }
})

export default router;