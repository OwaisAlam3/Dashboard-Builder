const API_URL = 'http://localhost:4000/api';

export const fetchTemplates = async () => {
  const res = await fetch(`${API_URL}/templates`);
  return res.json();
};

export const createDashboard = async (name, widgets) => {
  const res = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, widgets })
  });
  return res.json();
};
