import { render, screen } from '@testing-library/react'
import { StatisticsCard } from '@/components/StatisticsCard'

describe('StatisticsCard', () => {
  // Props por defecto para las pruebas
  const defaultProps = {
    title: 'Publicadas',
    value: 42,
    color: '#3f8600',
    loading: false,
  }

  describe('Rendering', () => {
    it('renders with all required props', () => {
      render(<StatisticsCard {...defaultProps} />)
      
      expect(screen.getByText('Publicadas')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('applies responsive layout classes', () => {
      render(<StatisticsCard {...defaultProps} />)
      const container = screen.getByText('Publicadas').closest('div')
      expect(container).toHaveClass(
        'flex',
        'flex-row',
        'justify-around',
        'items-center',
        'sm:flex-col'
      )
    })
  })

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<StatisticsCard {...defaultProps} loading={true} />)
      
      // Verificar que el valor no está visible
      expect(screen.queryByText('42')).not.toBeInTheDocument()
      // Verificar que el título sigue visible
      expect(screen.getByText('Publicadas')).toBeInTheDocument()
      // Verificar que el skeleton de carga está presente
      expect(document.querySelector('.ant-skeleton')).toBeInTheDocument()
    })

    it('shows content when loading is false', () => {
      render(<StatisticsCard {...defaultProps} loading={false} />)
      
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(document.querySelector('.ant-skeleton')).not.toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    it('handles zero values correctly', () => {
      render(<StatisticsCard {...defaultProps} value={0} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('handles large numbers correctly', () => {
      render(<StatisticsCard {...defaultProps} value={1000000} />)
      expect(screen.getByText('1,000,000')).toBeInTheDocument()
    })

  })

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      render(<StatisticsCard {...defaultProps} title="" />)
      // Busca el elemento p dentro del contenedor flex
      const container = document.querySelector('.flex.flex-row')
      const titleElement = container?.querySelector('p')
      // Verifica que el elemento existe y está vacío
      expect(titleElement).toBeInTheDocument()
      expect(titleElement?.textContent).toBe('')
    })

    it('handles negative values correctly', () => {
      render(<StatisticsCard {...defaultProps} value={-42} />)
      expect(screen.getByText('-42')).toBeInTheDocument()
    })

    it('maintains layout with very long titles', () => {
      const longTitle = 'This is a very very very very very long title'
      render(<StatisticsCard {...defaultProps} title={longTitle} />)
      
      const container = screen.getByText(longTitle).closest('div')
      expect(container).toHaveClass(
        'flex',
        'flex-row',
        'justify-around',
        'items-center',
        'sm:flex-col'
      )
    })
  })
})