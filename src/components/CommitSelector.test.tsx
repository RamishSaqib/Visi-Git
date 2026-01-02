import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CommitSelector from './CommitSelector'
import type { CommitInfo } from '../types'

describe('CommitSelector', () => {
  const mockCommits: CommitInfo[] = [
    {
      hash: 'abc123456789',
      short_hash: 'abc1234',
      message: 'First commit',
      author: 'Test User',
      date: '2024-01-15 10:30:00 -0500',
    },
    {
      hash: 'def987654321',
      short_hash: 'def9876',
      message: 'Second commit',
      author: 'Test User',
      date: '2024-01-16 14:20:00 -0500',
    },
  ]

  it('renders dropdown with commits', () => {
    render(
      <CommitSelector
        commits={mockCommits}
        selectedCommit={null}
        onSelect={() => {}}
        label="Base"
      />
    )

    // Open the dropdown
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    // Check that commits are in the dropdown options
    expect(screen.getByText(/abc1234/)).toBeInTheDocument()
    expect(screen.getByText(/def9876/)).toBeInTheDocument()
  })

  it('shows Working Directory option', () => {
    render(
      <CommitSelector
        commits={mockCommits}
        selectedCommit={null}
        onSelect={() => {}}
        label="Compare"
      />
    )

    expect(screen.getByText(/working directory/i)).toBeInTheDocument()
  })

  it('calls onSelect when commit selected', () => {
    const handleSelect = vi.fn()
    render(
      <CommitSelector
        commits={mockCommits}
        selectedCommit={null}
        onSelect={handleSelect}
        label="Base"
      />
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'abc123456789' } })

    expect(handleSelect).toHaveBeenCalledWith('abc123456789')
  })
})
