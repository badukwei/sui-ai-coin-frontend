import OpenAI from "openai";
import { openAISystemMessage } from "@/constants/ai/prompt";

const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

const openai = new OpenAI({
	apiKey: openAIApiKey,
	dangerouslyAllowBrowser: true,
});

/**
 * Fetch completion from OpenAI
 * @param {string} userContent - The user content to send to OpenAI.
 * @returns {Promise<string>} - The assistant's response.
 */
const fetchOpenAICompletion = async (userContent: string): Promise<string> => {
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: openAISystemMessage },
			{ role: "user", content: userContent },
		],
		store: true,
	});

	return completion.choices[0].message.content || "";
};

export default fetchOpenAICompletion;

// Example usage:
/*
const userContent = "Write a haiku about recursion in programming.";
fetchOpenAICompletion(userContent).then(response => {
    console.log(response);
}).catch(error => {
    console.error("Error fetching OpenAI completion:", error);
});
*/
