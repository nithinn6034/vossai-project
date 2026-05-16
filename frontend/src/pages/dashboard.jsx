import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const token    = localStorage.getItem('token')
  const userName = localStorage.getItem('name')
  const headers  = { Authorization: `Bearer ${token}` }

  const [tasks,    setTasks]    = useState([])
  const [filter,   setFilter]   = useState('All')
  const [error,    setError]    = useState('')
  const [editTask, setEditTask] = useState(null)

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [status,      setStatus]      = useState('Pending')
  const [dueDate,     setDueDate]     = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  function fetchTasks() {
    axios.get('http://127.0.0.1:8000/api/tasks', { headers })
      .then((res) => setTasks(res.data))
      .catch(() => setError('Failed to fetch tasks'))
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!title) { setError('Title is required'); return }

    axios.post('http://127.0.0.1:8000/api/tasks',
      { title, description, status, due_date: dueDate },
      { headers }
    ).then(() => {
      setTitle('')
      setDescription('')
      setStatus('Pending')
      setDueDate('')
      setError('')
      fetchTasks()
    }).catch(() => setError('Failed to create task'))
  }

  function handleDelete(id) {
    axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`, { headers })
      .then(() => fetchTasks())
      .catch(() => setError('Failed to delete task'))
  }

  function handleUpdate(e) {
    e.preventDefault()
    axios.put(`http://127.0.0.1:8000/api/tasks/${editTask.id}/`, editTask, { headers })
      .then(() => { setEditTask(null); fetchTasks() })
      .catch(() => setError('Failed to update task'))
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('name')
    navigate('/login')
  }

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div className="dashboard">

      {/* Navbar */}
      <div className="navbar">
        <h2>Task Manager</h2>
        <div>
          <span>Welcome, {userName}</span>
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

        {/* Filter */}
        <div className="filters">
          <button className={`filter-btn ${filter === 'All'         ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
          <button className={`filter-btn ${filter === 'Pending'     ? 'active' : ''}`} onClick={() => setFilter('Pending')}>Pending</button>
          <button className={`filter-btn ${filter === 'In Progress' ? 'active' : ''}`} onClick={() => setFilter('In Progress')}>In Progress</button>
          <button className={`filter-btn ${filter === 'Completed'   ? 'active' : ''}`} onClick={() => setFilter('Completed')}>Completed</button>
        </div>

        {/* Task List */}
        <div className="card">
          <h3>My Tasks ({filteredTasks.length})</h3>
          {filteredTasks.length === 0 && <p className="no-tasks">No tasks found</p>}
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
                <input type="text" value={editTask.title} onChange={(e) => setEditTask({...editTask, title: e.target.value})} />
                <textarea value={editTask.description} onChange={(e) => setEditTask({...editTask, description: e.target.value})} />
                <select value={editTask.status} onChange={(e) => setEditTask({...editTask, status: e.target.value})}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <input type="date" value={editTask.due_date || ''} onChange={(e) => setEditTask({...editTask, due_date: e.target.value})} />
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