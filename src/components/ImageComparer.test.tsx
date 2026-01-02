import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageComparer from './ImageComparer'

describe('ImageComparer', () => {
  const currentSrc = 'data:image/png;base64,currentImageData'
  const previousSrc = 'data:image/png;base64,previousImageData'

  it('renders both images', () => {
    render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
  })

  it('renders a slider control', () => {
    render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('type', 'range')
  })

  it('slider controls opacity of the new image', () => {
    render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

    const slider = screen.getByRole('slider')

    // Change slider to 50%
    fireEvent.change(slider, { target: { value: '50' } })

    // Check that the new image has 50% opacity
    const newImage = screen.getByAltText(/new/i)
    expect(newImage).toHaveStyle({ opacity: '0.5' })
  })

  it('shows labels for old and new versions', () => {
    render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

    // Check for the header labels specifically
    expect(screen.getByText('Old (HEAD)')).toBeInTheDocument()
    expect(screen.getByText('New (Working)')).toBeInTheDocument()
  })

  it('shows "New File" indicator when no previous version', () => {
    render(<ImageComparer currentSrc={currentSrc} previousSrc={null} />)

    expect(screen.getByText(/new file/i)).toBeInTheDocument()
  })

  it('shows "Deleted" indicator when no current version', () => {
    render(<ImageComparer currentSrc={null} previousSrc={previousSrc} />)

    expect(screen.getByText(/deleted/i)).toBeInTheDocument()
  })

  it('shows placeholder when no images provided', () => {
    render(<ImageComparer currentSrc={null} previousSrc={null} />)

    expect(screen.getByText(/select an image/i)).toBeInTheDocument()
  })
})
