import { useState, useEffect } from 'react';
import io from "socket.io-client";

const socket = io('http://localhost:5001'); // Connect to your backend

function App() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Receive initial messages when connecting
    socket.on('initial_messages', (initial) => {
      setMessages(initial);
    });

    // Receive new messages in real-time
    socket.on('new_message', (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('initial_messages');
      socket.off('new_message');
    };
  }, []);

  const getUrgencyStyle = (score) => {
    if (score >= 8) return 'bg-red-600 text-white';
    if (score >= 5) return 'bg-orange-500 text-white';
    return 'bg-green-600 text-white';
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Left: Message Queue */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h1 className="p-4 text-xl font-bold border-b bg-blue-600 text-white">
          Support Queue
        </h1>
        {messages.length === 0 ? (
          <p className="p-4 text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selected?.id === msg.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">User {msg.user_id}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${getUrgencyStyle(
                    msg.urgency
                  )}`}
                >
                  {msg.urgency}/10
                </span>
              </div>
              <p className="text-sm mt-1 line-clamp-2">{msg.body}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {msg.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: Message Details + Mock Customer Info */}
      <div className="w-2/3 flex flex-col">
        {selected ? (
          <>
            <div className="p-6 border-b bg-white">
              <h2 className="text-2xl font-bold">
                Conversation with User {selected.user_id}
              </h2>
              <p className="text-gray-600 mt-1">
                Urgency: <strong>{selected.urgency}/10</strong>
              </p>
              {/* Mock Customer Context */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-2">Customer Info</h3>
                <ul className="text-sm space-y-1">
                  <li>Credit Score: 742</li>
                  <li>Account Status: Active</li>
                  <li>Last Payment: 10 Feb 2026</li>
                  <li>Loan Type: Personal</li>
                </ul>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="bg-white p-4 rounded-lg shadow-sm max-w-2xl">
                <p className="text-gray-800">{selected.body}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {selected.timestamp}
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-white">
              <input
                type="text"
                placeholder="Type your reply..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
            <p className="text-xl">Select a message from the queue</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;