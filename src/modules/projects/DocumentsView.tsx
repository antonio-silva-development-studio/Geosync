import { clsx } from 'clsx';
import { FileText, Plus, Save, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Input } from '../../shared/ui/Input';
import { MarkdownEditor } from '../../shared/ui/MarkdownEditor';
import { useAppStore } from '../../store/useAppStore';
import type { Document } from '../../types';
import { useProjectsStore } from '../projects/store';

const DocumentEditor = ({ doc }: { doc: Document }) => {
  const { updateDocument } = useAppStore();
  const [editTitle, setEditTitle] = useState(doc.title);
  const [editContent, setEditContent] = useState(doc.content);
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = async () => {
    await updateDocument(doc.id, {
      title: editTitle,
      content: editContent,
      updatedAt: new Date().toISOString(),
    });
    setIsDirty(false);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
        <Input
          value={editTitle}
          onChange={(e) => {
            setEditTitle(e.target.value);
            setIsDirty(true);
          }}
          className="flex-1 max-w-md"
          placeholder="Document Title"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty}
          className={clsx(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            isDirty
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600',
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
  );
};

export const DocumentsView: React.FC = () => {
  const { documents, addDocument, removeDocument, fetchDocuments } = useAppStore();
  const { currentProject } = useProjectsStore();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Fetch documents when project changes
  useEffect(() => {
    if (currentProject) {
      fetchDocuments(currentProject.id);
    }
  }, [currentProject, fetchDocuments]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const handleCreate = async () => {
    if (!currentProject) return;
    const newDoc: Document = {
      id: crypto.randomUUID(),
      projectId: currentProject.id,
      title: 'Untitled Document',
      content: '# Untitled\n\nStart writing...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addDocument(newDoc);
    setSelectedDocId(newDoc.id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      await removeDocument(id);
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
            type="button"
            onClick={handleCreate}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="New Document"
          >
            <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-2 space-y-1">
          {documents.map((doc) => (
            <button
              type="button"
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={clsx(
                'flex w-full items-center justify-between rounded-md p-2 text-sm transition-colors',
                selectedDoc?.id === doc.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{doc.title}</span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(doc.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
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
          <DocumentEditor key={selectedDoc.id} doc={selectedDoc} />
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
