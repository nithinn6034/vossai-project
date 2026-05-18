import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    axios.post('https://vossai.onrender.com/api/register/', { name, email, password })
      .then((res) => {
        setSuccess('Registration successful! Redirecting...')
        setTimeout(() => navigate('/login'), 2000)
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Registration failed')
      })
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error   && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit}>
          <input type="text"     placeholder="Full Name" value={name}     onChange={(e) => setName(e.target.value)} />
          <input type="email"    placeholder="Email"     value={email}    onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password"  value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Register</button>
        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register