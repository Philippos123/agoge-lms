import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ModuleItem from '../components/editor/ModuleItem';
import TextEditor from '../components/editor/TextEditor';

export default function CourseEditor() {
  // Initial state för moduler
  const [modules, setModules] = useState([
    {
      id: 'module-1',
      title: 'Introduktion',
      lessons: [
        { id: 'lesson-1', title: 'Välkommen', type: 'text', content: '' }
      ]
    }
  ]);

  const [activeLesson, setActiveLesson] = useState(null);

  // Funktion för att uppdatera en lektion
  const updateLesson = (updatedLesson) => {
    setModules(prevModules => prevModules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => 
        lesson.id === activeLesson?.id ? updatedLesson : lesson
      )
    })));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar med moduler */}
      <div className="w-64 bg-white border-r p-4">
        <DndContext modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={modules}>
            {modules.map(module => (
              <ModuleItem 
                key={module.id} 
                module={module}
                onClick={() => setActiveLesson(module.lessons[0])}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Huvudinnehåll */}
      <div className="flex-1 p-6 overflow-auto">
        {activeLesson?.type === 'text' && (
          <TextEditor 
            lesson={activeLesson} 
            updateLesson={updateLesson}  // Skicka funktionen som prop
          />
        )}
      </div>
    </div>
  );
}