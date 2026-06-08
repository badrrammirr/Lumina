import sqlite3
import os
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "lumina.db"

def get_connection():
    """Get a database connection."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables."""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL,
                last_login TIMESTAMP,
                role TEXT DEFAULT 'user'
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
            )
        ''')

        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)')

        conn.commit()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        conn.close()

def get_user_by_username(username: str):
    """Get user by username."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id: int):
    """Get user by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def create_user(username: str, password_hash: str, email: str = None):
    """Create a new user."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    try:
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, created_at, updated_at, role)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, email, password_hash, now, now, 'user'))

        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError("Username already exists")
    except Exception as e:
        conn.close()
        raise e

def update_last_login(user_id: int):
    """Update user's last login time."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute('UPDATE users SET last_login = ? WHERE id = ?', (now, user_id))
    conn.commit()
    conn.close()

def create_chat(user_id: int, title: str):
    """Create a new chat."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute('''
        INSERT INTO chats (user_id, title, created_at, updated_at)
        VALUES (?, ?, ?, ?)
    ''', (user_id, title, now, now))

    conn.commit()
    chat_id = cursor.lastrowid
    conn.close()
    return chat_id

def get_user_chats(user_id: int):
    """Get all chats for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, title, created_at, updated_at FROM chats
        WHERE user_id = ?
        ORDER BY updated_at DESC
    ''', (user_id,))

    chats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return chats

def get_chat_messages(chat_id: int):
    """Get all messages in a chat."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, role, content, timestamp FROM messages
        WHERE chat_id = ?
        ORDER BY timestamp ASC
    ''', (chat_id,))

    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return messages

def add_message(chat_id: int, role: str, content: str):
    """Add a message to a chat."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute('''
        INSERT INTO messages (chat_id, role, content, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (chat_id, role, content, now))

    conn.commit()
    message_id = cursor.lastrowid
    conn.close()
    return message_id

def delete_chat(chat_id: int):
    """Delete a chat and its messages."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('DELETE FROM messages WHERE chat_id = ?', (chat_id,))
    cursor.execute('DELETE FROM chats WHERE id = ?', (chat_id,))

    conn.commit()
    conn.close()

def rename_chat(chat_id: int, new_title: str):
    """Rename a chat."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()

    cursor.execute('''
        UPDATE chats SET title = ?, updated_at = ?
        WHERE id = ?
    ''', (new_title, now, chat_id))

    conn.commit()
    conn.close()
