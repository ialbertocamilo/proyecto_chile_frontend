'use client'
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import CustomButton from './CustomButton';
import { useWebSocket, WebSocketProvider } from './WebSocketProvider';

interface WebSocketComponentProps {
    path?: string; // Optional path to append to the WebSocket URL
    onMessageReceived?: (data: any) => void; // Callback to return data to parent component
    onConnectionChange?: (status: boolean) => void; // Optional callback for connection status changes
}

const WebSocketComponent: React.FC<WebSocketComponentProps> = ({
    path = 'ws',
    onMessageReceived,
    onConnectionChange
}) => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);

    return (
        <WebSocketProvider
            path={path}
            onMessage={(data) => {
                setMessages(prev => [...prev, data]);
                if (onMessageReceived) {
                    onMessageReceived(data);
                }
            }}
            autoReconnect={true}
        >
            <WebSocketContent
                message={message}
                setMessage={setMessage}
                messages={messages}
                onConnectionChange={onConnectionChange}
            />
        </WebSocketProvider>
    );
};

interface WebSocketContentProps {
    message: string;
    setMessage: (message: string) => void;
    messages: any[];
    onConnectionChange?: (status: boolean) => void;
}

const WebSocketContent: React.FC<WebSocketContentProps> = ({
    message,
    setMessage,
    messages,
    onConnectionChange
}) => {
    const { connected, sendMessage, reconnect } = useWebSocket();
    const [token, setToken] = useState<string | null>(null);

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    // Notify parent component of connection status changes
    useEffect(() => {
        if (onConnectionChange) {
            onConnectionChange(connected);
        }
    }, [connected, onConnectionChange]);

    const handleSend = () => {
        if (message.trim()) {
            if (message.startsWith('/')) {
                console.log('Command sent:', message);
                sendMessage({ command: message.substring(1), type: 'command', token: token, project_id: id });
            } else {
                sendMessage({ type: 'message', content: message });
            }
            setMessage('');
        }
    };

    return (
        <div className="websocket-container p-3 border rounded">
            <div className="d-flex align-items-center mb-3">
                <div className="me-2">
                    Estado:
                    {connected ? (
                        <span className="text-success ms-1">
                            Conectado <span className="badge bg-success">•</span>
                        </span>
                    ) : (
                        <span className="text-danger ms-1">
                            Desconectado <span className="badge bg-danger">•</span>
                        </span>
                    )}
                </div>
                {!connected && (
                    <CustomButton onClick={reconnect} size="sm">
                        Reconectar
                    </CustomButton>
                )}
            </div>

            <div
                className="websocket-messages mb-3 p-2 border rounded "
                style={{ height: '200px', overflowY: 'auto' }}
            >
                {messages.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center py-4">No hay mensajes</div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="p-2 mb-2 border-bottom">
                            <pre className="m-0">
                                {JSON.stringify(msg, null, 2)}
                            </pre>
                        </div>
                    ))
                )}
            </div>

            <div className="d-flex">
                <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Escriba un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!connected}
                />
                <CustomButton onClick={handleSend} disabled={!connected || !message.trim()}>
                    Enviar
                </CustomButton>
            </div>

            {!connected && (
                <div className="text-center mt-3">
                    <Spinner animation="border" size="sm" role="status" />
                    <span className="ms-2">Intentando conectar...</span>
                </div>
            )}
        </div>
    );
};

export default WebSocketComponent;
