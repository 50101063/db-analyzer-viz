import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const VisualizationPage = () => {
  const { connectionId: routeConnectionId } = useParams(); // Get connectionId from URL
  const [connections, setConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState(routeConnectionId || '');
  const [schemas, setSchemas] = useState({}); // { tableName: [columns] }
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState([]); // Columns for selected table
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [aggregation, setAggregation] = useState('NONE');
  const [chartType, setChartType] = useState('Bar');
  const [filters, setFilters] = useState(''); // Simple string for now, will be JSON in backend
  const [visualizationData, setVisualizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [configName, setConfigName] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState('');

  // Fetch connections on load
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get('/connections/');
        setConnections(response.data);
        if (response.data.length > 0 && !selectedConnectionId) {
          setSelectedConnectionId(response.data[0].id); // Auto-select first connection if none in URL
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  // Fetch schema when connection changes
  useEffect(() => {
    const fetchSchema = async () => {
      if (!selectedConnectionId) return;
      setLoading(true);
      setError('');
      try {
        const response = await axiosInstance.get(`/data/schema/${selectedConnectionId}`);
        setSchemas(response.data);
        const firstTable = Object.keys(response.data)[0];
        if (firstTable) {
          setSelectedTable(firstTable);
          setColumns(response.data[firstTable]);
          // Reset axis selections
          setXAxis('');
          setYAxis('');
        } else {
          setSelectedTable('');
          setColumns([]);
          setXAxis('');
          setYAxis('');
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch schema.');
        setSchemas({});
        setSelectedTable('');
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchema();
    fetchSavedConfigs(selectedConnectionId); // Fetch configs for new connection
  }, [selectedConnectionId]);

  // Update columns when table changes
  useEffect(() => {
    if (selectedTable && schemas[selectedTable]) {
      setColumns(schemas[selectedTable]);
      // Reset axis selections
      setXAxis('');
      setYAxis('');
    } else {
      setColumns([]);
    }
  }, [selectedTable, schemas]);

  // Fetch saved configurations for the selected connection
  const fetchSavedConfigs = async (connId) => {
    if (!connId) return;
    try {
      const response = await axiosInstance.get(`/visualizations/configs/${connId}`);
      setSavedConfigs(response.data);
    } catch (err) {
      console.error('Failed to fetch saved configurations:', err);
      // Don't block UI on this error
    }
  };

  const handleGenerateVisualization = async () => {
    setError('');
    setVisualizationData(null);
    if (!selectedConnectionId || !selectedTable || !xAxis || !yAxis) {
      setError('Please select a connection, table, X-axis, and Y-axis.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        connection_id: selectedConnectionId,
        table_name: selectedTable,
        x_axis_column: xAxis,
        y_axis_column: yAxis,
        aggregation_type: aggregation,
        chart_type: chartType,
        filters: filters ? JSON.parse(filters) : {}, // Ensure filters are JSON
      };
      const response = await axiosInstance.post('/data/visualize', payload);
      setVisualizationData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate visualization.');
      setVisualizationData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setError('');
    if (!configName) {
      setError('Please provide a name for the configuration.');
      return;
    }
    if (!selectedConnectionId || !selectedTable || !xAxis || !yAxis || !chartType || !aggregation) {
      setError('Please complete all visualization settings before saving.');
      return;
    }

    try {
      const payload = {
        connection_id: selectedConnectionId,
        name: configName,
        table_name: selectedTable,
        x_axis_column: xAxis,
        y_axis_column: yAxis,
        aggregation_type: aggregation,
        chart_type: chartType,
        filters: filters ? JSON.parse(filters) : {},
      };
      await axiosInstance.post('/visualizations/configs/', payload);
      alert('Configuration saved successfully!');
      fetchSavedConfigs(selectedConnectionId); // Refresh saved configs list
      setConfigName(''); // Clear config name input
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save configuration.');
    }
  };

  const handleLoadConfiguration = async () => {
    setError('');
    if (!selectedConfigId) {
      setError('Please select a configuration to load.');
      return;
    }
    try {
      const config = savedConfigs.find(cfg => cfg.id === selectedConfigId);
      if (config) {
        setSelectedConnectionId(config.connection_id);
        setSelectedTable(config.table_name);
        setXAxis(config.x_axis_column);
        setYAxis(config.y_axis_column);
        setAggregation(config.aggregation_type);
        setChartType(config.chart_type);
        setFilters(JSON.stringify(config.filters || {}, null, 2)); // Pretty print JSON
        setConfigName(config.name); // Set config name input

        // Automatically generate visualization after loading config
        // This might re-fetch schema if connection_id changed, which is fine
        // Then trigger visualization generation
        // Note: This needs to ensure schema is loaded before attempting to visualize
        // For simplicity, we'll just call generate here, assuming schema is ready or will be fetched.
        await handleGenerateVisualization();
      }
    } catch (err) {
      setError('Failed to load configuration.');
      console.error(err);
    }
  };

  const handleDeleteConfiguration = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      setError('');
      try {
        await axiosInstance.delete(`/visualizations/configs/${id}`);
        alert('Configuration deleted successfully!');
        fetchSavedConfigs(selectedConnectionId);
        if (selectedConfigId === id) {
          setSelectedConfigId(''); // Clear selection if deleted
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete configuration.');
      }
    }
  };

  const renderChart = () => {
    if (!visualizationData || visualizationData.length === 0) {
      return <p className="text-center text-gray-600">No data to display or data is empty.</p>;
    }

    const numericYAxis = columns.find(col => col.name === yAxis && ['INTEGER', 'FLOAT', 'DOUBLE'].includes(col.type.toUpperCase()));

    switch (chartType) {
      case 'Bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={visualizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxis} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'Line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={visualizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxis} stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'Pie':
        // Pie charts typically use one category (X) and one value (Y)
        // Recharts Pie expects data to be an array of objects with value and name properties
        const pieData = visualizationData.map(item => ({ name: item[xAxis], value: item[yAxis] }));
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'Scatter':
        // Scatter chart needs two numeric axes
        if (!numericYAxis || !columns.find(col => col.name === xAxis && ['INTEGER', 'FLOAT', 'DOUBLE'].includes(col.type.toUpperCase()))) {
          return <p className="text-center text-red-500">Scatter plots require both X and Y axes to be numeric.</p>;
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey={xAxis} name={xAxis} />
              <YAxis type="number" dataKey={yAxis} name={yAxis} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Data" data={visualizationData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return <p className="text-center text-gray-600">Select a chart type to visualize your data.</p>;
    }
  };

  const handleExportChart = () => {
    // This is a placeholder. Real implementation would use html2canvas + jspdf
    alert('Export chart functionality to be implemented. Will export as PNG/SVG.');
    // Example using a hypothetical chart ref:
    // if (chartRef.current) {
    //   html2canvas(chartRef.current.container).then(canvas => {
    //     const imgData = canvas.toDataURL('image/png');
    //     const link = document.createElement('a');
    //     link.href = imgData;
    //     link.download = 'chart.png';
    //     link.click();
    //   });
    // }
  };

  // Determine available aggregation types based on yAxis column type
  const getAvailableAggregations = () => {
    const yAxisColumn = columns.find(col => col.name === yAxis);
    if (!yAxisColumn) return ['NONE'];

    const numericTypes = ['INTEGER', 'FLOAT', 'DOUBLE', 'NUMBER']; // Common numeric types
    const isNumeric = numericTypes.includes(yAxisColumn.type.toUpperCase());

    if (isNumeric) {
      return ['NONE', 'SUM', 'AVG', 'COUNT', 'MIN', 'MAX'];
    } else {
      return ['NONE', 'COUNT']; // Count can be applied to any type
    }
  };

  if (loading && connections.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Visualization</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Configure Visualization</h2>

          <div className="mb-4">
            <label htmlFor="connection" className="block text-sm font-medium text-gray-700 mb-1">Select Connection</label>
            <select
              id="connection"
              value={selectedConnectionId}
              onChange={(e) => setSelectedConnectionId(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">-- Select a connection --</option>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>{conn.name}</option>
              ))}
            </select>
          </div>

          {selectedConnectionId && (
            <>
              <div className="mb-4">
                <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-1">Select Table/Collection</label>
                <select
                  id="table"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2"
                  disabled={Object.keys(schemas).length === 0}
                >
                  <option value="">-- Select a table --</option>
                  {Object.keys(schemas).map((tableName) => (
                    <option key={tableName} value={tableName}>{tableName}</option>
                  ))}
                </select>
              </div>

              {selectedTable && (
                <>
                  <div className="mb-4">
                    <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700 mb-1">X-Axis Column</label>
                    <select
                      id="xAxis"
                      value={xAxis}
                      onChange={(e) => setXAxis(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">-- Select X-axis --</option>
                      {columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700 mb-1">Y-Axis Column</label>
                    <select
                      id="yAxis"
                      value={yAxis}
                      onChange={(e) => setYAxis(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">-- Select Y-axis --</option>
                      {columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name} ({col.type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="aggregation" className="block text-sm font-medium text-gray-700 mb-1">Aggregation</label>
                    <select
                      id="aggregation"
                      value={aggregation}
                      onChange={(e) => setAggregation(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                      disabled={!yAxis} // Disable if no Y-axis selected
                    >
                      {getAvailableAggregations().map(agg => (
                        <option key={agg} value={agg}>{agg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
                    <select
                      id="chartType"
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="Bar">Bar Chart</option>
                      <option value="Line">Line Chart</option>
                      <option value="Pie">Pie Chart</option>
                      <option value="Scatter">Scatter Plot</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="filters" className="block text-sm font-medium text-gray-700 mb-1">Filters (JSON)</label>
                    <textarea
                      id="filters"
                      value={filters}
                      onChange={(e) => setFilters(e.target.value)}
                      placeholder='{"column_name": "value", "operator": "="}'
                      rows="3"
                      className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter filters as a JSON object (e.g., `{"age": {"operator": ">", "value": 30}}`).
                      Operators: `=`, `!=`, `>`, `<`, `>=`, `<=`, `LIKE`, `IN`.
                    </p>
                  </div>

                  <Button onClick={handleGenerateVisualization} variant="primary" className="w-full mt-4">
                    Generate Visualization
                  </Button>
                </>
              )}
            </>
          )}

          <hr className="my-6" />

          {/* Save/Load Configuration */}
          <h2 className="text-xl font-semibold mb-4">Save/Load Configuration</h2>
          <Input
            label="Configuration Name"
            id="configName"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="My Sales Chart"
          />
          <Button onClick={handleSaveConfiguration} variant="secondary" className="w-full mt-2">
            Save Current Configuration
          </Button>

          <div className="mt-4">
            <label htmlFor="savedConfig" className="block text-sm font-medium text-gray-700 mb-1">Load Saved Configuration</label>
            <select
              id="savedConfig"
              value={selectedConfigId}
              onChange={(e) => setSelectedConfigId(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">-- Select a saved config --</option>
              {savedConfigs.map((config) => (
                <option key={config.id} value={config.id}>{config.name}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2 mt-2">
            <Button onClick={handleLoadConfiguration} variant="outline" className="flex-grow">Load Config</Button>
            {selectedConfigId && (
              <Button onClick={() => handleDeleteConfiguration(selectedConfigId)} variant="danger" className="flex-grow">Delete Config</Button>
            )}
          </div>
        </div>

        {/* Visualization Display */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center min-h-[450px]">
          {loading && visualizationData === null ? (
            <LoadingSpinner size="lg" />
          ) : (
            renderChart()
          )}
          {visualizationData && (
            <Button onClick={handleExportChart} variant="secondary" className="mt-6">
              Export Chart as Image
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizationPage;
