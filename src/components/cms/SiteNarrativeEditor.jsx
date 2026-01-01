import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SiteNarrativeEditor({ formData, setFormData }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    // Parse content into sections based on markdown headers
    if (formData.content) {
      const parsed = parseContentIntoSections(formData.content);
      setSections(parsed);
    } else {
      setSections([{ id: 1, label: 'Introduction', content: '' }]);
    }
  }, []);

  const parseContentIntoSections = (content) => {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    let sectionId = 1;

    lines.forEach(line => {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          id: sectionId++,
          label: line.replace('## ', '').trim(),
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      } else if (line.trim()) {
        // Content before first header
        if (!currentSection) {
          currentSection = {
            id: sectionId++,
            label: 'Introduction',
            content: line + '\n'
          };
        }
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : [{ id: 1, label: 'Introduction', content: '' }];
  };

  const updateSection = (id, field, value) => {
    setSections(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, [field]: value } : s);
      syncToFormData(updated);
      return updated;
    });
  };

  const addSection = () => {
    const newSection = {
      id: Math.max(...sections.map(s => s.id), 0) + 1,
      label: 'New Section',
      content: ''
    };
    setSections(prev => {
      const updated = [...prev, newSection];
      syncToFormData(updated);
      return updated;
    });
  };

  const removeSection = (id) => {
    setSections(prev => {
      const updated = prev.filter(s => s.id !== id);
      syncToFormData(updated);
      return updated;
    });
  };

  const syncToFormData = (updatedSections) => {
    const content = updatedSections
      .map(s => `## ${s.label}\n\n${s.content.trim()}`)
      .join('\n\n');
    setFormData({ ...formData, content });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-400">Structured Page Editor</h3>
        <Button
          onClick={addSection}
          size="sm"
          className="bg-violet-500 hover:bg-violet-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="p-4 bg-black/20 border border-white/10 rounded-lg"
          >
            <div className="flex items-start gap-3 mb-3">
              <GripVertical className="w-5 h-5 text-zinc-600 mt-2 cursor-move" />
              <div className="flex-1">
                <Input
                  value={section.label}
                  onChange={(e) => updateSection(section.id, 'label', e.target.value)}
                  className="bg-black/30 border-white/10 font-semibold mb-2"
                  placeholder="Section Title"
                />
                <Textarea
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  className="bg-black/30 border-white/10 font-mono text-sm min-h-[120px]"
                  placeholder="Section content (Markdown supported)..."
                />
              </div>
              {sections.length > 1 && (
                <button
                  onClick={() => removeSection(section.id)}
                  className="p-2 hover:bg-red-500/20 rounded transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <FileText className="w-3 h-3" />
              Section {index + 1} of {sections.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}