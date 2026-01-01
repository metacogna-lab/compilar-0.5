import React from 'react';
import { Wand2, FileText, Eye, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorToolbar({ 
  onAIWriter, 
  onMetadata, 
  onPreview, 
  onCancel, 
  onSave,
  loading,
  selectedFile 
}) {
  return (
    <div className="flex items-center gap-2">
      {selectedFile?.type === 'prompts' && (
        <div className="text-sm text-zinc-400 mr-4">
          Read-only reference
        </div>
      )}
      <Button
        onClick={onAIWriter}
        size="sm"
        className="bg-violet-500 hover:bg-violet-600 text-white flex items-center"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        AI Writer
      </Button>
      <Button
        onClick={onMetadata}
        size="sm"
        className="bg-violet-500 hover:bg-violet-600 text-white flex items-center"
      >
        <FileText className="w-4 h-4 mr-2" />
        Metadata
      </Button>
      <Button
        onClick={onPreview}
        size="sm"
        className="bg-violet-500 hover:bg-violet-600 text-white flex items-center"
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>
      <Button
        onClick={onCancel}
        size="sm"
        className="bg-violet-500 hover:bg-violet-600 text-white flex items-center"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button
        onClick={onSave}
        disabled={loading}
        size="sm"
        className="bg-violet-500 hover:bg-violet-600 text-white flex items-center"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}