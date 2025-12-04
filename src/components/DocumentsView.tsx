import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, FileText, Trash2, Save } from 'lucide-react';
import { clsx } from 'clsx';
import { MarkdownEditor } from './MarkdownEditor';
import { Document } from '../types';

export const DocumentsView: React.FC = () => {
  const { currentProject, documents, addDocument, updateDocument, removeDocument } = useAppStore();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Mock loading documents for now (or use store if implemented)
  // In a real app, we'd fetch from backend here.
  // For now, we rely on the store's state.

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  useEffect(() => {
    if (selectedDoc) {
      setEditTitle(selectedDoc.title);
      setEditContent(selectedDoc.content);
      setIsDirty(false);
    }
  }, [selectedDocId, documents]); // Re-run when selection changes or docs update

  const handleCreate = () => {
    if (!currentProject) return;
    const newDoc: Document = {
      id: crypto.randomUUID(),
      projectId: currentProject.id,
      title: 'Untitled Document',
      content: '# Untitled\n\nStart writing...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addDocument(newDoc);
    setSelectedDocId(newDoc.id);
  };

  const handleSave = () => {
    if (!selectedDoc) return;
    updateDocument(selectedDoc.id, {
      title: editTitle,
      content: editContent,
      updatedAt: new Date().toISOString(),
    });
    setIsDirty(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      removeDocument(id);
      if (selectedDocId === id) {
        setSelectedDocId(null);
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Documents
          </h2>
          <button
            onClick={handleCreate}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="New Document"
          >
            <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-2 space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={clsx(
                "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                selectedDocId === doc.id
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{doc.title}</span>
              </div>
              <button
                onClick={(e) => handleDelete(doc.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-400">
              No documents yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {selectedDoc ? (
          <>
            <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  setIsDirty(true);
                }}
                className="bg-transparent text-xl font-bold text-gray-900 focus:outline-none dark:text-white"
                placeholder="Document Title"
              />
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={clsx(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isDirty
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                )}
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-6">
              <MarkdownEditor
                value={editContent}
                onChange={(val) => {
                  setEditContent(val);
                  setIsDirty(true);
                }}
                className="h-full"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 opacity-50" />
              <h3 className="mt-2 text-lg font-medium">Select a document</h3>
              <p className="mt-1">Or create a new one to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
