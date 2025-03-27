import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useNavigate } from 'react-router-dom';
import { CourseService } from '../services/api';
import { SortableItem } from './SortableItem';
import ReactMarkdown from 'react-markdown';

export default function CourseEditor() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Drag and drop handlers
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = modules.findIndex(m => m.id === active.id);
    const newIndex = modules.findIndex(m => m.id === over.id);
    
    setModules(items => {
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      return newItems.map((item, index) => ({ ...item, order: index + 1 }));
    });
  };

  // Module management
  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: 'New Module',
      order: modules.length + 1,
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  // Lesson management - Uppdaterad för att stödja image-text
  const addLesson = (moduleId, type = 'text') => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        const baseLesson = {
          id: `lesson-${Date.now()}`,
          title: 'New Lesson',
          order: module.lessons.length + 1,
          type
        };

        const content = type === 'image-text' 
          ? { text: '', imageUrl: '' } 
          : '';

        return {
          ...module,
          lessons: [
            ...module.lessons,
            { ...baseLesson, content }
          ]
        };
      }
      return module;
    }));
  };

  // Delete handlers
  const deleteModule = (moduleId) => {
    setModules(modules.filter(module => module.id !== moduleId)
      .map((module, index) => ({ ...module, order: index + 1 })));
  };

  const deleteLesson = (moduleId, lessonId) => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
            .map((lesson, index) => ({ ...lesson, order: index + 1 }))
        };
      }
      return module;
    }));
  };

  // Update handlers
  const updateModuleTitle = (moduleId, newTitle) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, title: newTitle } : module
    ));
  };

  const updateLesson = (moduleId, lessonId, field, value) => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.map(lesson => 
            lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
          )
        };
      }
      return module;
    }));
  };

  const updateLessonContent = (moduleId, lessonId, content) => {
    setModules(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.map(lesson => 
            lesson.id === lessonId ? { ...lesson, content } : lesson
          )
        };
      }
      return module;
    }));
  };

  // Content type selector
  const ContentTypeSelector = ({ moduleId, lessonId, type }) => (
    <select
      value={type}
      onChange={(e) => updateLesson(moduleId, lessonId, 'type', e.target.value)}
      className="mb-2 p-1 border rounded"
    >
      <option value="text">Text</option>
      <option value="image-text">Bild+Text</option>
      <option value="video">Video</option>
      <option value="quiz">Quiz</option>
    </select>
  );

  // Image upload handler
  const handleImageUpload = (moduleId, lessonId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const currentLesson = modules
        .find(m => m.id === moduleId)
        ?.lessons.find(l => l.id === lessonId);
      
      if (currentLesson) {
        updateLessonContent(
          moduleId,
          lessonId,
          {
            ...currentLesson.content,
            imageUrl: event.target.result
          }
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Render content based on type
  const renderLessonContent = (moduleId, lesson) => {
    if (previewMode) {
      return renderPreview(lesson);
    }

    switch (lesson.type) {
      case 'image-text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Bild</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(moduleId, lesson.id, e)}
                className="mb-2"
              />
              {lesson.content.imageUrl && (
                <img 
                  src={lesson.content.imageUrl} 
                  alt="Preview" 
                  className="max-h-60 mb-4 rounded"
                />
              )}
            </div>
            <textarea
              value={lesson.content.text}
              onChange={(e) => updateLessonContent(
                moduleId,
                lesson.id,
                { ...lesson.content, text: e.target.value }
              )}
              className="w-full h-32 p-2 border rounded"
              placeholder="Skriv din text här..."
            />
          </div>
        );
      
      case 'text':
        return (
          <textarea
            value={lesson.content}
            onChange={(e) => updateLesson(moduleId, lesson.id, 'content', e.target.value)}
            className="w-full h-32 p-2 border rounded"
            placeholder="Skriv din text här..."
          />
        );
      
      case 'video':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={lesson.content}
              onChange={(e) => updateLesson(moduleId, lesson.id, 'content', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter video URL..."
            />
            {lesson.content && (
              <iframe
                src={lesson.content}
                className="w-full aspect-video"
                allowFullScreen
                title="Video player"
              />
            )}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-2">
            <textarea
              value={lesson.content}
              onChange={(e) => updateLesson(moduleId, lesson.id, 'content', e.target.value)}
              className="w-full h-32 p-2 border rounded"
              placeholder="Enter quiz JSON structure..."
            />
            <small className="text-gray-500">Use JSON format for questions</small>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render preview
  const renderPreview = (lesson) => {
    switch (lesson.type) {
      case 'image-text':
        return (
          <div className="prose max-w-none">
            {lesson.content.imageUrl && (
              <img 
                src={lesson.content.imageUrl} 
                alt={lesson.title} 
                className="rounded-lg mb-4"
              />
            )}
            <ReactMarkdown>{lesson.content.text}</ReactMarkdown>
          </div>
        );
      
      case 'text':
        return <ReactMarkdown className="prose">{lesson.content}</ReactMarkdown>;
      
      case 'video':
        return (
          <div className="aspect-video">
            <iframe
              src={lesson.content}
              className="w-full h-full"
              allowFullScreen
              title="Video player"
            />
          </div>
        );
      
      case 'quiz':
        return <pre>{lesson.content}</pre>;
      
      default:
        return null;
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!courseTitle.trim()) {
      setError('Course title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const courseData = {
        title: courseTitle,
        modules: modules.map(module => ({
          title: module.title,
          order: module.order,
          lessons: module.lessons.map(lesson => ({
            title: lesson.title,
            content: lesson.content,
            type: lesson.type,
            order: lesson.order
          }))
        }))
      };

      const response = await CourseService.createCourse(courseData);
      if (response.data.id) {
        navigate(`/course/${response.data.id}/edit`);
      }
    } catch (err) {
      console.error('Course creation failed:', err);
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Preview toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className={`px-4 py-2 rounded ${
            previewMode ? 'bg-gray-200' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {previewMode ? 'Avsluta förhandsgranskning' : 'Förhandsgranska'}
        </button>
      </div>

      {/* Course Title */}
      <input
        type="text"
        placeholder="Course Title"
        value={courseTitle}
        onChange={(e) => setCourseTitle(e.target.value)}
        className="text-3xl font-bold mb-8 p-2 border-b-2 w-full focus:outline-none"
        disabled={previewMode}
      />

      {/* Error Message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Module List */}
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={modules} strategy={verticalListSortingStrategy}>
          {modules.map(module => (
            <SortableItem key={module.id} id={module.id}>
              <div className="bg-white shadow-lg rounded-lg mb-6">
                {/* Module Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                    className="font-semibold text-lg bg-transparent flex-1 mr-4"
                    disabled={previewMode}
                  />
                  {!previewMode && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addLesson(module.id, 'image-text')}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add Lesson
                      </button>
                      <button 
                        onClick={() => deleteModule(module.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Lessons List */}
                <div className="p-4">
                  {module.lessons.map(lesson => (
                    <div key={lesson.id} className="mb-4 p-4 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                          className="font-medium flex-1 mr-2"
                          disabled={previewMode}
                        />
                        {!previewMode && (
                          <ContentTypeSelector 
                            moduleId={module.id}
                            lessonId={lesson.id}
                            type={lesson.type}
                          />
                        )}
                      </div>

                      {renderLessonContent(module.id, lesson)}

                      {!previewMode && (
                        <button
                          onClick={() => deleteLesson(module.id, lesson.id)}
                          className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete Lesson
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Module Button */}
      {!previewMode && (
        <button
          onClick={addModule}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Module
        </button>
      )}

      {/* Save Course Button */}
      {!previewMode && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 float-right disabled:bg-gray-400"
        >
          {isSubmitting ? 'Saving...' : 'Publish Course'}
        </button>
      )}
    </div>
  );
}