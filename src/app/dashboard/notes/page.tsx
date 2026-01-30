'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

interface Note {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote }),
      });

      if (res.ok) {
        setNewNote('');
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-d2i-cyan animate-pulse">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Notes</h1>
        <p className="text-d2i-cyan/80">Quick notes and reminders</p>
      </div>

      {/* Add Note */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
          onKeyPress={(e) => e.key === 'Enter' && addNote()}
          className="flex-1 px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none"
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-d2i-teal to-d2i-cyan text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Add Note
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-5 rounded-2xl group bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20 card-hover"
          >
            <p className="text-white mb-3">{note.text}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-d2i-cyan/60">{formatTime(note.createdAt)}</span>
              <button
                onClick={() => deleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Icons.Trash />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50">No notes yet. Add your first note above!</p>
        </div>
      )}
    </div>
  );
}
