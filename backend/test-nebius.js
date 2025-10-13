import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Enhanced Nebius API Diagnostic Tool\n');
console.log(`📝 API Key: ${process.env.NEBIUS_API_KEY ? process.env.NEBIUS_API_KEY.substring(0, 20) + '...' : 'NOT FOUND'}\n`);

// Test configurations with model listing
const baseURLs = [
    'https://api.studio.nebius.ai/v1',
    'https://api.studio.nebius.com/v1',
    'https://inference.studio.nebius.ai/v1',
    'https://api.nebius.ai/v1'
];

async function listModels(baseURL) {
    console.log(`\n🔍 Testing: ${baseURL}`);
    
    const client = new OpenAI({
        apiKey: process.env.NEBIUS_API_KEY,
        baseURL: baseURL,
    });

    try {
        console.log('   → Attempting to list models...');
        const models = await client.models.list();
        console.log('   ✅ SUCCESS! Available models:');
        
        if (models.data && models.data.length > 0) {
            models.data.forEach(model => {
                console.log(`      - ${model.id}`);
            });
            return { success: true, baseURL, models: models.data };
        } else {
            console.log('      (No models returned)');
            return { success: true, baseURL, models: [] };
        }
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.status || 'Unknown'} - ${error.message}`);
        if (error.response) {
            console.log(`   Response: ${JSON.stringify(error.response.data)}`);
        }
        return { success: false, baseURL, error: error.message };
    }
}

async function testChatCompletion(baseURL, modelId) {
    console.log(`\n🧪 Testing chat completion with model: ${modelId}`);
    
    const client = new OpenAI({
        apiKey: process.env.NEBIUS_API_KEY,
        baseURL: baseURL,
    });

    try {
        const response = await client.chat.completions.create({
            model: modelId,
            max_tokens: 50,
            messages: [
                { role: "user", content: "Say hello!" }
            ]
        });

        const content = response.choices[0]?.message?.content;
        console.log(`   ✅ SUCCESS! Response: "${content}"`);
        return true;
    } catch (error) {
        console.log(`   ❌ FAILED: ${error.status || 'Unknown'} - ${error.message}`);
        return false;
    }
}

async function runDiagnostics() {
    console.log('=' .repeat(60));
    console.log('STEP 1: Finding correct base URL and listing models');
    console.log('=' .repeat(60));

    let workingConfig = null;

    for (const baseURL of baseURLs) {
        const result = await listModels(baseURL);
        
        if (result.success && result.models && result.models.length > 0) {
            workingConfig = result;
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!workingConfig) {
        console.log('\n❌ Could not find working base URL.');
        console.log('\n💡 Troubleshooting steps:');
        console.log('1. Verify your API key is correct in .env file');
        console.log('2. Check if your Nebius account is active');
        console.log('3. Visit https://studio.nebius.ai/ and check API settings');
        console.log('4. Look for API documentation in your Nebius dashboard');
        return;
    }

    console.log('\n' + '=' .repeat(60));
    console.log('STEP 2: Testing chat completion with first available model');
    console.log('=' .repeat(60));

    const firstModel = workingConfig.models[0];
    await testChatCompletion(workingConfig.baseURL, firstModel.id);

    console.log('\n' + '=' .repeat(60));
    console.log('✨ CONFIGURATION FOR YOUR storyRoutes.js:');
    console.log('=' .repeat(60));
    console.log(`
const client = new OpenAI({
  apiKey: process.env.NEBIUS_API_KEY,
  baseURL: '${workingConfig.baseURL}',
});

// Use one of these models:
${workingConfig.models.map(m => `// - "${m.id}"`).join('\n')}
    `);
}

runDiagnostics().catch(console.error);