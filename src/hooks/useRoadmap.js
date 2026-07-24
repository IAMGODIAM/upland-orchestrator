import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useRoadmap() {
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const [sprintRows, taskRows] = await Promise.all([
      base44.entities.Sprint.list('order', 50),
      base44.entities.RoadmapTask.list('order', 200)
    ]);
    setSprints(sprintRows); setTasks(taskRows); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const createSprint = async (data) => { await base44.entities.Sprint.create({ ...data, status: 'planned', order: sprints.length + 1 }); await load(); };
  const updateSprint = async (id, data) => { if (data.status === 'active') { const others = sprints.filter((sprint) => sprint.id !== id && sprint.status === 'active').map((sprint) => ({ id: sprint.id, status: 'planned' })); if (others.length) await base44.entities.Sprint.bulkUpdate(others); } await base44.entities.Sprint.update(id, data); await load(); };
  const createTask = async (data) => { await base44.entities.RoadmapTask.create({ ...data, status: 'backlog', order: tasks.length + 1 }); await load(); };
  const updateTask = async (id, data) => { await base44.entities.RoadmapTask.update(id, data); await load(); };
  const deleteTask = async (id) => { await base44.entities.RoadmapTask.delete(id); await load(); };
  return { sprints, tasks, loading, createSprint, updateSprint, createTask, updateTask, deleteTask };
}