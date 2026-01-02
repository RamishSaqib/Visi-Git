import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FileList from './FileList'
import type { ChangedFile } from '../types'

describe('FileList', () => {
  const mockFiles: ChangedFile[] = [
    { path: 'images/logo.png', filename: 'logo.png', status: 'modified' },
    { path: 'assets/icon.svg', filename: 'icon.svg', status: 'added' },
    { path: 'old/banner.jpg', filename: 'banner.jpg', status: 'deleted' },
  ]

  it('renders a list of files', () => {
    render(<FileList files={mockFiles} selectedFile={null} onSelect={() => {}} />)

    expect(screen.getByText('logo.png')).toBeInTheDocument()
    expect(screen.getByText('icon.svg')).toBeInTheDocument()
    expect(screen.getByText('banner.jpg')).toBeInTheDocument()
  })

  it('shows status indicators for each file', () => {
    render(<FileList files={mockFiles} selectedFile={null} onSelect={() => {}} />)

    // Check that status indicators exist (M for modified, A for added, D for deleted)
    expect(screen.getByText('M')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('calls onSelect when a file is clicked', () => {
    const handleSelect = vi.fn()
    render(<FileList files={mockFiles} selectedFile={null} onSelect={handleSelect} />)

    fireEvent.click(screen.getByText('logo.png'))

    expect(handleSelect).toHaveBeenCalledWith('images/logo.png')
  })

  it('highlights the selected file', () => {
    render(
      <FileList
        files={mockFiles}
        selectedFile="images/logo.png"
        onSelect={() => {}}
      />
    )

    const selectedItem = screen.getByText('logo.png').closest('button')
    expect(selectedItem).toHaveClass('bg-blue-100')
  })

  it('shows empty state when no files', () => {
    render(<FileList files={[]} selectedFile={null} onSelect={() => {}} />)

    expect(screen.getByText(/no changed images/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<FileList files={[]} selectedFile={null} onSelect={() => {}} isLoading />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
