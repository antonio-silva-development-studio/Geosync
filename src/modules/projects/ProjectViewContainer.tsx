import type React from 'react';
import { ProjectDetailView } from './components/ProjectDetailView';
import { useProjectsStore } from './store';

export const ProjectViewContainer: React.FC = () => {
  const { currentProject } = useProjectsStore();

  if (!currentProject) return null;

  return <ProjectDetailView project={currentProject} />;
};
