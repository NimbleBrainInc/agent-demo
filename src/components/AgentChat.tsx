import { Agent, Message } from "@nimblebrain/api-spec";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Image, Spinner, Stack } from "react-bootstrap";
import { Send, Trash } from "react-bootstrap-icons";
import Markdown from "react-markdown";

const AgentChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const agentId = import.meta.env.VITE_AGENT_ID;
  const apiKey = import.meta.env.VITE_API_KEY;

  const baseUrl = `${apiUrl}/v1`;

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`${baseUrl}/agents/${agentId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch agent: ${response.status}`);
        }

        const responseData = await response.json();
        setAgent(responseData.data);
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setIsLoadingAgent(false);
      }
    };

    fetchAgent();
  }, [agentId, apiKey, apiUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewConversation = async (initialMessage: string) => {
    try {
      // Create user message immediately
      const userMessage = {
        id: crypto.randomUUID(),
        isSystem: false,
        text: initialMessage,
        dateCreated: new Date(),
      };
      setMessages([userMessage]);

      const response = await fetch(`${baseUrl}/agents/${agentId}/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ text: initialMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Create conversation error:", errorData);
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const responseData = await response.json();
      const conversation = responseData.data;
      if (!conversation?.id) {
        throw new Error("Invalid conversation response format");
      }

      setConversationId(conversation.id);

      if (conversation.messages?.length > 0) {
        setMessages((prev) => [...prev, ...conversation.messages]);
      }

      return conversation.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const userMessage = {
        id: crypto.randomUUID(),
        isSystem: false,
        text: text,
        dateCreated: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        currentConversationId = await createNewConversation(text);
        return;
      }

      const response = await fetch(
        `${baseUrl}/agents/${agentId}/conversations/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Send message error:", errorData);
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const responseData = await response.json();
      const newMessage = responseData.data;
      if (!newMessage) {
        throw new Error("Invalid message response format");
      }

      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  if (isLoadingAgent) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <h3>Error loading agent</h3>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url(background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5))",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        {/* Header */}
        <div className="p-3 bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              {agent.avatarUrl && (
                <Image
                  src={agent.avatarUrl}
                  roundedCircle
                  width={40}
                  height={40}
                  className="object-fit-cover"
                />
              )}
              <h4 className="mb-0">{agent.title}</h4>
            </div>
            <Button
              variant="outline-danger"
              onClick={clearChat}
              className="d-flex align-items-center gap-2"
            >
              <Trash /> New Chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-grow-1 overflow-auto p-3"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
          }}
        >
          <Stack gap={2} className="mb-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex ${
                  message.isSystem ? "justify-content-start" : "justify-content-end"
                } mb-2`}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    backgroundColor: message.isSystem ? "#f0f0f0" : "#007bff",
                    color: message.isSystem ? "#000" : "#fff",
                    padding: "8px 12px",
                    borderRadius: message.isSystem ? "15px 15px 15px 0" : "15px 15px 0 15px",
                    position: "relative",
                    marginLeft: message.isSystem ? "8px" : "0",
                    marginRight: message.isSystem ? "0" : "8px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "4px", wordBreak: "break-word" }}>
                    <Markdown>{message.text}</Markdown>
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      textAlign: message.isSystem ? "left" : "right",
                    }}
                  >
                    {format(new Date(message.dateCreated), "MMM d, yyyy, hh:mm a")}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-top">
          <Form onSubmit={handleSubmit}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="rounded-pill"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="d-flex align-items-center gap-2 rounded-pill px-3"
              >
                {isLoading && <Spinner animation="border" size="sm" />}
                {!isLoading && (
                  <>
                    <Send /> Send
                  </>
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
