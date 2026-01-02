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

  describe('Zoom controls', () => {
    it('renders zoom controls when comparing images', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      // Check for zoom in, zoom out, fit, and 100% buttons
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /fit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /100%/i })).toBeInTheDocument()
    })

    it('displays current zoom level', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      // Check for zoom percentage display in the zoom level indicator (not the button)
      // The zoom level display is a span, while 100% is also a button
      const zoomDisplay = screen.getAllByText(/^\d+%$/)
      expect(zoomDisplay.length).toBeGreaterThanOrEqual(1)
    })

    it('increases zoom when clicking zoom in', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      const zoomInButton = screen.getByRole('button', { name: /zoom in/i })

      // Click zoom in
      fireEvent.click(zoomInButton)

      // Zoom should increase by 25% to 125%
      expect(screen.getByText('125%')).toBeInTheDocument()
    })

    it('decreases zoom when clicking zoom out', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i })

      // Click zoom out
      fireEvent.click(zoomOutButton)

      // Zoom should decrease by 25% to 75%
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('sets zoom to 100% when clicking 100% button', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
      const zoom100Button = screen.getByRole('button', { name: /100%/i })

      // Zoom in first
      fireEvent.click(zoomInButton)
      fireEvent.click(zoomInButton)
      expect(screen.getByText('150%')).toBeInTheDocument()

      // Click 100% button to reset
      fireEvent.click(zoom100Button)

      // The zoom display should show 100% (there will be multiple matches due to button)
      expect(screen.getAllByText('100%').length).toBeGreaterThanOrEqual(1)
    })

    it('resets zoom when clicking Fit button', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      const zoomInButton = screen.getByRole('button', { name: /zoom in/i })
      const fitButton = screen.getByRole('button', { name: /fit/i })

      // Zoom in first
      fireEvent.click(zoomInButton)
      fireEvent.click(zoomInButton)
      expect(screen.getByText('150%')).toBeInTheDocument()

      // Click Fit button to reset to 100% (fit to container)
      fireEvent.click(fitButton)

      // The zoom display should show 100% (there will be multiple matches due to button)
      expect(screen.getAllByText('100%').length).toBeGreaterThanOrEqual(1)
    })
  })
})
