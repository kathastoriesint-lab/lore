'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'absolute', inset: 0,
          background: '#08080F', display: 'flex',
          flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 16, padding: 32,
        }}>
          <div style={{ fontSize: 32 }}>⚡</div>
          <div style={{ fontFamily: '"Fraunces",serif', fontSize: 22, color: '#fff', textAlign: 'center' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: '#a8a8b3', textAlign: 'center', maxWidth: 260 }}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </div>
          <button
            style={{
              marginTop: 8, padding: '14px 28px',
              background: '#FF2D78', color: '#fff',
              fontFamily: '"Poppins",sans-serif', fontWeight: 700,
              fontSize: 14, border: 'none', borderRadius: 14, cursor: 'pointer',
            }}
            onClick={() => {
              this.setState({ error: null })
              window.location.href = '/'
            }}
          >
            Restart →
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
