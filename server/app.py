from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from textblob import TextBlob
import eventlet

# This makes SocketIO work better on Windows
eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'my-super-secret-key-for-testing'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
CORS(app)

# Temporary storage - messages list (we'll use database later)
messages = []
next_message_id = 1

# Very simple analysis function
def analyze_message(text):
    text_lower = text.lower()
    blob = TextBlob(text_lower)
    
    # Sentiment: positive / neutral / negative
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    # Urgency score starts low
    urgency = 3
    
    # Boost if negative
    if sentiment == "negative":
        urgency += 3
    
    tags = [sentiment.capitalize()]
    
    # Urgent keywords
    urgent_words = ["urgent", "emergency", "immediately", "asap", "rejected", "help now", "crisis"]
    for word in urgent_words:
        if word in text_lower:
            urgency = max(urgency, 8)
            tags.append("Urgent")
            break
    
    # Basic topic tags
    if any(w in text_lower for w in ["loan", "apply", "approved", "disburse"]):
        tags.append("Loan")
    if any(w in text_lower for w in ["pay", "payment", "emi", "due", "repay"]):
        tags.append("Payment")
    
    return {
        "urgency": min(urgency, 10),
        "tags": list(set(tags))  # remove duplicates
    }

# API to add a new message (you'll test with curl later)
@app.route('/api/messages', methods=['POST'])
def add_message():
    global next_message_id
    
    data = request.get_json()
    body = data.get('body', '')
    user_id = data.get('user_id', 'guest')
    
    if not body:
        return jsonify({"error": "No message body"}), 400
    
    analysis = analyze_message(body)
    
    message = {
        "id": next_message_id,
        "user_id": user_id,
        "body": body,
        "urgency": analysis["urgency"],
        "tags": analysis["tags"],
        "timestamp": "now"  # we'll improve this later
    }
    
    messages.append(message)
    next_message_id += 1
    
    # Send the new message to all connected clients (real-time!)
    socketio.emit('new_message', message)
    
    return jsonify(message), 201

# When someone connects via Socket.IO
@socketio.on('connect')
def handle_connect():
    print("A user/agent connected!")
    emit('initial_messages', messages)  # send all existing messages

# Run the server
if __name__ == '__main__':
    print("Starting backend server on port 5001...")
    socketio.run(app, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)