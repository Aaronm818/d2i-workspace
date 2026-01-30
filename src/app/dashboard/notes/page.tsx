'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newNote }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes([data.note, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      <div className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a note..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-d2i-navy-dark border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none resize-none"
        />
        <button
          onClick={addNote}
          disabled={!newNote.trim() || isSaving}
          className="mt-3 px-6 py-2 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Add Note'}
        </button>
      </div>

      <div className="space-y-3">
        {notes.length === 0 && (
          <div className="text-center text-white/50 py-8">
            <p>No notes yet. Add your first note above!</p>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20 group"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-white/85 whitespace-pre-wrap flex-1">{note.text}</p>
              <button
                onClick={() => deleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Icons.Trash />
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2">{formatDate(note.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
