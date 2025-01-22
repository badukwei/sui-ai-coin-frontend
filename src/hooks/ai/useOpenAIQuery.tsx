// import { useQuery } from '@tanstack/react-query';
// import OpenAI from 'openai';

// const openai = new OpenAI();

// interface Message {
//     role: 'system' | 'user' | 'assistant';
//     content: string;
//     name?: string;
// }

// interface OpenAIQueryParams {
//     apiKey: string;
//     model?: string;
//     messages: Message[];
//     store?: boolean;
// }

// /**
//  * useOpenAIQuery
//  * @param {OpenAIQueryParams} params - Parameters for the OpenAI chat completions request.
//  * @returns {Object} react-query's query result object.
//  */
// const useOpenAIQuery = (params: OpenAIQueryParams) => {
//     return useQuery({
//         queryKey: ['openai', params],
//         queryFn: async () => {
//             if (!params.apiKey) throw new Error('API Key is required');

//             const completion = await openai.chat.completions.create({
//                 model: params.model || 'gpt-4o-mini',
//                 messages: params.messages.map(message => ({
//                     ...message,
//                     name: message.name || 'default', 
//                 })),
//                 store: params.store || false,
//             });

//             return completion;
//         },
//         enabled: !!params.apiKey,
//     });
// };

// export default useOpenAIQuery;

// // Example
// /*
// import React from 'react';
// import useOpenAIQuery from './useOpenAIQuery';

// const OpenAIComponent: React.FC = () => {
//     const { data, isLoading, error } = useOpenAIQuery({
//         apiKey: 'your-openai-api-key',
//         model: 'gpt-4o-mini',
//         messages: [
//             { role: 'system', content: 'You are a helpful assistant.', name: 'system' },
//             { role: 'user', content: 'Write a haiku about recursion in programming.', name: 'user' },
//         ],
//         store: true,
//     });

//     if (isLoading) return <div>Loading...</div>;
//     if (error) return <div>Error: {error.message}</div>;

//     return <div>Response: {data.choices[0].message.content}</div>;
// };

// export default OpenAIComponent;
// */
