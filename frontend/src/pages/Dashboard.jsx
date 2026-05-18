import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const API = 'https://vossai.onrender.com'

function Dashboard() {
  const navigate = useNavigate()
  const token    = localStorage.getItem('token')
  const userName = localStorage.getItem('name')
  const headers  = { Authorization: `Bearer ${token}` }

  const [tasks,    setTasks]    = useState([])
  const [filter,   setFilter]   = useState('All')
  const [error,    setError]    = useState('')
  const [editTask, setEditTask] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [search,   setSearch]   = useState('')

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [status,      setStatus]      = useState('Pending')
  const [dueDate,     setDueDate]     = useState('')

  useEffect(() => { fetchTasks() }, [])

  function fetchTasks() {
    axios.get(`${API}/api/tasks/`, { headers })
      .then((res) => setTasks(res.data))
      .catch(() => setError('Failed to fetch tasks'))
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!title) { setError('Title is required'); return }
    axios.post(`${API}/api/tasks/`,
      { title, description, status, due_date: dueDate },
      { headers }
    ).then(() => {
      setTitle(''); setDescription(''); setStatus('Pending'); setDueDate(''); setError('')
      fetchTasks()
    }).catch(() => setError('Failed to create task'))
  }

  function handleDelete(id) {
    axios.delete(`${API}/api/tasks/${id}/`, { headers })
      .then(() => fetchTasks())
      .catch(() => setError('Failed to delete task'))
  }

  function handleUpdate(e) {
    e.preventDefault()
    axios.put(`${API}/api/tasks/${editTask.id}/`, editTask, { headers })
      .then(() => { setEditTask(null); fetchTasks() })
      .catch(() => setError('Failed to update task'))
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    navigate('/login')
  }

  const filteredTasks = tasks
    .filter(t => filter === 'All' || t.status === filter)
    .filter(t => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      )
    })

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>

      <div className="navbar">
        <h2>Task Manager</h2>
        <div>
          <span>Welcome, {userName}</span>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="content">
        {error && <p className="error">{error}</p>}

        {/* Add Task */}
        <div className="card">
          <h3>Add New Task</h3>
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <button type="submit">Add Task</button>
          </form>
        </div>

        {/* Search Box */}
        <div style={{
          background: '#fff',
          padding: '16px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <input
            type="text"
            placeholder="🔍 Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              color: '#333',
              outline: 'none'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                padding: '8px 14px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filters">
          {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="card">
          <h3>My Tasks ({filteredTasks.length})</h3>
          {filteredTasks.length === 0 && (
            <p className="no-tasks">
              {search ? `No tasks matching "${search}"` : 'No tasks found'}
            </p>
          )}
          {filteredTasks.map(task => (
            <div key={task.id} className="task-item">
              <div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p className={`status ${task.status.replace(' ', '-').toLowerCase()}`}>
                  {task.status} | Due: {task.due_date || 'No date'}
                </p>
              </div>
              <div className="task-btns">
                <button className="edit-btn"   onClick={() => setEditTask(task)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editTask && (
          <div className="modal">
            <div className="modal-card">
              <h3>Edit Task</h3>
              <form onSubmit={handleUpdate}>
                <input type="text" value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} />
                <textarea value={editTask.description || ''} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} />
                <select value={editTask.status} onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <input type="date" value={editTask.due_date || ''} onChange={(e) => setEditTask({ ...editTask, due_date: e.target.value })} />
                <button type="submit">Update</button>
                <button type="button" className="cancel-btn" onClick={() => setEditTask(null)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard