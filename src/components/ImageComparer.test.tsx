import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ImageComparer from './ImageComparer'

describe('ImageComparer', () => {
  const currentSrc = 'data:image/png;base64,currentImageData'
  const previousSrc = 'data:image/png;base64,previousImageData'

  it('renders both images in onion skin mode', () => {
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

  describe('View mode toggle', () => {
    it('shows all three view mode options when both images present', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      expect(screen.getByRole('radio', { name: /onion skin/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /side by side/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /diff/i })).toBeInTheDocument()
    })

    it('defaults to Onion Skin mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      expect(screen.getByRole('radio', { name: /onion skin/i })).toBeChecked()
    })

    it('switches to Diff mode when toggle clicked', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      fireEvent.click(screen.getByRole('radio', { name: /diff/i }))
      expect(screen.getByRole('radio', { name: /diff/i })).toBeChecked()
    })

    it('switches to Side by Side mode when toggle clicked', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      const sideBySideRadio = screen.getByRole('radio', { name: /side by side/i })
      fireEvent.click(sideBySideRadio)
      expect(sideBySideRadio).toBeChecked()
      expect(screen.getByRole('radio', { name: /onion skin/i })).not.toBeChecked()
    })

    it('does not show view mode toggle for new files', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={null} />)
      expect(screen.queryByRole('radio', { name: /onion skin/i })).not.toBeInTheDocument()
    })

    it('does not show view mode toggle for deleted files', () => {
      render(<ImageComparer currentSrc={null} previousSrc={previousSrc} />)
      expect(screen.queryByRole('radio', { name: /onion skin/i })).not.toBeInTheDocument()
    })
  })

  describe('Diff mode', () => {
    it('shows sensitivity slider in Diff mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      fireEvent.click(screen.getByRole('radio', { name: /diff/i }))
      expect(screen.getByRole('slider', { name: /sensitivity/i })).toBeInTheDocument()
    })

    it('hides opacity slider in Diff mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      // In onion skin mode, the opacity slider should exist
      expect(screen.getByRole('slider')).toBeInTheDocument()

      // Switch to diff mode
      fireEvent.click(screen.getByRole('radio', { name: /diff/i }))

      // The slider should now be the sensitivity slider, not opacity
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-label', 'Sensitivity')
    })

    it('shows diff canvas in Diff mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      fireEvent.click(screen.getByRole('radio', { name: /diff/i }))
      expect(screen.getByTestId('diff-canvas')).toBeInTheDocument()
    })

    it('sensitivity slider has default value of 10', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      fireEvent.click(screen.getByRole('radio', { name: /diff/i }))
      const slider = screen.getByRole('slider', { name: /sensitivity/i })
      expect(slider).toHaveValue('10')
    })

    it('sensitivity slider range is 0-50', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      fireEvent.click(screen.getByRole('radio', { name: /diff/i }))
      const slider = screen.getByRole('slider', { name: /sensitivity/i })
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '50')
    })
  })

  describe('Side by Side mode', () => {
    it('shows two images in separate containers with labels', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      // Switch to side-by-side mode
      const sideBySideRadio = screen.getByRole('radio', { name: /side by side/i })
      fireEvent.click(sideBySideRadio)

      // Should have "Old" and "New" labels in the side-by-side view
      expect(screen.getByText('Old')).toBeInTheDocument()
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('hides opacity slider in side-by-side mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      // Slider should be present in default onion skin mode
      expect(screen.getByRole('slider')).toBeInTheDocument()

      // Switch to side-by-side mode
      const sideBySideRadio = screen.getByRole('radio', { name: /side by side/i })
      fireEvent.click(sideBySideRadio)

      // Slider should not be present in side-by-side mode
      expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    })
  })

  describe('Onion Skin mode', () => {
    it('shows opacity slider in Onion Skin mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      // Default is onion skin mode
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    it('hides diff canvas in Onion Skin mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)
      // Default is onion skin mode
      expect(screen.queryByTestId('diff-canvas')).not.toBeInTheDocument()
    })
  })
})
