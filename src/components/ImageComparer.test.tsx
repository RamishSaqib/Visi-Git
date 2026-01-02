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

  describe('view mode toggle', () => {
    it('renders view mode toggle when both images present', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      expect(screen.getByRole('radio', { name: /onion skin/i })).toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /side by side/i })).toBeInTheDocument()
    })

    it('Onion Skin is selected by default', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      const onionSkinRadio = screen.getByRole('radio', { name: /onion skin/i })
      expect(onionSkinRadio).toBeChecked()
    })

    it('clicking Side by Side switches the mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      const sideBySideRadio = screen.getByRole('radio', { name: /side by side/i })
      fireEvent.click(sideBySideRadio)

      expect(sideBySideRadio).toBeChecked()
      expect(screen.getByRole('radio', { name: /onion skin/i })).not.toBeChecked()
    })

    it('side-by-side mode shows two images in separate containers', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      // Switch to side-by-side mode
      const sideBySideRadio = screen.getByRole('radio', { name: /side by side/i })
      fireEvent.click(sideBySideRadio)

      // Should have "Old" and "New" labels in the side-by-side view
      expect(screen.getByText('Old')).toBeInTheDocument()
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('opacity slider only shows in onion skin mode', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={previousSrc} />)

      // Slider should be present in default onion skin mode
      expect(screen.getByRole('slider')).toBeInTheDocument()

      // Switch to side-by-side mode
      const sideBySideRadio = screen.getByRole('radio', { name: /side by side/i })
      fireEvent.click(sideBySideRadio)

      // Slider should not be present in side-by-side mode
      expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    })

    it('toggle does NOT appear for new files', () => {
      render(<ImageComparer currentSrc={currentSrc} previousSrc={null} />)

      expect(screen.queryByRole('radio', { name: /onion skin/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio', { name: /side by side/i })).not.toBeInTheDocument()
    })

    it('toggle does NOT appear for deleted files', () => {
      render(<ImageComparer currentSrc={null} previousSrc={previousSrc} />)

      expect(screen.queryByRole('radio', { name: /onion skin/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio', { name: /side by side/i })).not.toBeInTheDocument()
    })
  })
})
