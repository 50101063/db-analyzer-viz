import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null); // For edit mode
  const [form, setForm] = useState({
    name: '',
    type: 'PostgreSQL', // Default type
    host: '',
    port: '',
    database_name: '',
    username: '',
    password: '',
  });
  const [testResult, setTestResult] = useState('');

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/connections/');
      setConnections(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const openAddModal = () => {
    setCurrentConnection(null);
    setForm({
      name: '',
      type: 'PostgreSQL',
      host: '',
      port: '',
      database_name: '',
      username: '',
      password: '',
    });
    setTestResult('');
    setIsModalOpen(true);
  };

  const openEditModal = (connection) => {
    setCurrentConnection(connection);
    setForm({
      name: connection.name,
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database_name: connection.database_name,
      username: connection.username,
      // Password is not returned by API for security, user must re-enter if changing
      password: '',
    });
    setTestResult('');
    setIsModalOpen(true);
  };

  const closeMmodal = () => {
    setIsModalOpen(false);
    setTestResult('');
    setError('');
  };

  const handleTestConnection = async () => {
    setTestResult('Testing...');
    setError('');
    try {
      const payload = { ...form };
      // Remove password if it's empty and in edit mode (not changing password)
      if (!payload.password && currentConnection) {
        delete payload.password;
      }
      await axiosInstance.post('/connections/test', payload);
      setTestResult('Connection successful!');
    } catch (err) {
      setTestResult('Connection failed!');
      setError(err.response?.data?.detail || 'An error occurred during testing.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      // Remove password if it's empty and in edit mode (not changing password)
      if (!payload.password && currentConnection) {
        delete payload.password;
      }

      if (currentConnection) {
        await axiosInstance.put(`/connections/${currentConnection.id}`, payload);
      } else {
        await axiosInstance.post('/connections/', payload);
      }
      await fetchConnections();
      closeMmodal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save connection.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      setError('');
      try {
        await axiosInstance.delete(`/connections/${id}`);
        await fetchConnections();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete connection.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Database Connections</h1>
      <Button onClick={openAddModal} variant="primary" className="mb-6">
        Add New Connection
      </Button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {connections.length === 0 ? (
        <p className="text-gray-600">No connections added yet. Click "Add New Connection" to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <div key={conn.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">{conn.name}</h3>
              <p className="text-gray-700"><strong>Type:</strong> {conn.type}</p>
              <p className="text-gray-700"><strong>Host:</strong> {conn.host}:{conn.port}</p>
              <p className="text-gray-700"><strong>Database:</strong> {conn.database_name}</p>
              <p className="text-gray-700"><strong>User:</strong> {conn.username}</p>
              <div className="mt-4 flex space-x-2">
                <Button onClick={() => openEditModal(conn)} variant="secondary" className="flex-grow">Edit</Button>
                <Button onClick={() => handleDelete(conn.id)} variant="danger" className="flex-grow">Delete</Button>
                <Button onClick={() => alert('Connect functionality to be implemented')} variant="outline" className="flex-grow">Connect</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeMmodal} title={currentConnection ? 'Edit Connection' : 'Add New Connection'}>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Input
            label="Connection Name"
            id="name"
            value={form.name}
            onChange={handleChange}
            placeholder="My Database Connection"
            required
          />
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
            <select
              id="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="MySQL">MySQL</option>
              <option value="MongoDB">MongoDB</option>
            </select>
          </div>
          <Input
            label="Host/IP Address"
            id="host"
            value={form.host}
            onChange={handleChange}
            placeholder="localhost or 192.168.1.1"
            required
          />
          <Input
            label="Port"
            id="port"
            type="number"
            value={form.port}
            onChange={handleChange}
            placeholder="5432 (PostgreSQL), 3306 (MySQL), 27017 (MongoDB)"
            required
          />
          <Input
            label="Database Name/Schema"
            id="database_name"
            value={form.database_name}
            onChange={handleChange}
            placeholder="my_database"
            required
          />
          <Input
            label="Username"
            id="username"
            value={form.username}
            onChange={handleChange}
            placeholder="dbuser"
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={currentConnection ? "Leave blank to keep current password" : "Database password"}
            required={!currentConnection} // Required only for new connections
          />
          <div className="flex justify-between items-center mt-6">
            <Button type="button" onClick={handleTestConnection} variant="outline">
              Test Connection
            </Button>
            {testResult && (
              <span className={`ml-4 ${testResult.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {testResult}
              </span>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" onClick={closeMmodal} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {currentConnection ? 'Update Connection' : 'Add Connection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConnectionsPage;
