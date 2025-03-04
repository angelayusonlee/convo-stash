import React, { useState, useEffect } from 'react';
import { getQueryParam } from '../utils/getQueryParam';

const Chatbot: React.FC = () => {
    const participantId = getQueryParam('participantId');
    const apiKey = getQueryParam('apiKey');
    const endpoint = getQueryParam('endpoint');
    const model = getQueryParam('model');
    const initialChatHistory = getQueryParam('chatHistory') ? JSON.parse(getQueryParam('chatHistory') || '[]') : [];

    const [chatHistory, setChatHistory] = useState(initialChatHistory);

    // Function to send a message to OpenRouter
    const sendMessage = async (message: string) => {
        const response = await fetch(endpoint!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [...chatHistory, { role: 'user', content: message }],
            }),
        });

        const data = await response.json();
        const newMessage = { role: 'assistant', content: data.choices[0].message.content };

        setChatHistory([...chatHistory, { role: 'user', content: message }, newMessage]);
    };

    // Function to send chat history back to Qualtrics
    const sendChatHistoryToQualtrics = () => {
        if (window.parent && participantId) {
            window.parent.postMessage({
                type: 'qualtricsEmbeddedData',
                participantId: participantId,
                chatHistory: JSON.stringify(chatHistory)
            }, '*'); // Use '*' for testing; replace with Qualtrics' origin for security
        }
    };

    // Send chat history when component unmounts
    useEffect(() => {
        return () => sendChatHistoryToQualtrics();
    }, [chatHistory]);

    return (
        <div>
            <h2>Chatbot</h2>
            <div>
                {chatHistory.map((msg, index) => (
                    <p key={index}><strong>{msg.role}:</strong> {msg.content}</p>
                ))}
            </div>
            <input type="text" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    sendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                }
            }} />
        </div>
    );
};

export default Chatbot;
