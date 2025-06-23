import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Plus, Calendar, MapPin, Settings, Archive } from 'lucide-react';
import { Project } from '../types/project';
import { saveProject, getProjects, deleteProject, generateProjectId } from '../utils/projectStorage';

interface ProjectManagerProps {
  currentProject: Partial<Project>;
  onProjectLoad: (project: Project) => void;
  onNewProject: () => void;
}

export default function ProjectManager({ currentProject, onProjectLoad, onNewProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const project: Project = {
      id: currentProject.id || generateProjectId(),
      name: projectName,
      createdAt: currentProject.createdAt || new Date(),
      updatedAt: new Date(),
      roofSize: currentProject.roofSize || 1000,
      roofType: currentProject.roofType || 'Photocatalytic Coating',
      includeSolar: currentProject.includeSolar || false,
      useMetric: currentProject.useMetric !== undefined ? currentProject.useMetric : true,
      location: currentProject.location,
      notes: currentProject.notes,
      status: 'completed'
    };

    saveProject(project);
    loadProjects();
    setShowSaveDialog(false);
    setProjectName('');
    alert('Project saved successfully!');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      loadProjects();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'calculating': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Project</span>
        </button>
        
        <button
          onClick={() => setShowManager(!showManager)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Manage Projects ({projects.length})</span>
        </button>
        
        <button
          onClick={onNewProject}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setProjectName('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Manager */}
      {showManager && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Saved Projects</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved projects yet</p>
                <p className="text-sm">Save your current configuration to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Settings className="w-3 h-3" />
                            <span>{project.roofType}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{project.roofSize} {project.useMetric ? 'm²' : 'sq ft'}</span>
                          </div>
                          {project.location && (
                            <div className="flex items-center space-x-1 col-span-2">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{project.location.address}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Updated: {formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            onProjectLoad(project);
                            setShowManager(false);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}