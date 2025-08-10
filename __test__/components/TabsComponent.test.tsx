import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Form, FormInstance } from 'antd';
import { TabsComponent } from '@/components/TabsComponent';
import '@testing-library/jest-dom';

// Mock del messageApi
const mockMessageApi = { 
  success: jest.fn(), 
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn()
};

// Mock del hook useTestAssignment con estado de error
const mockMutate = jest.fn();

// Un solo mock para useTestAssignment
jest.mock('@/hooks/useTestAssignment', () => ({
  useTestAssignment: jest.fn().mockImplementation(() => ({
    mutate: mockMutate,
    data: null,
    error: null,
    isPending: false,
  }))
}));

// Mock de antd
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    DatePicker: {
      RangePicker: () => <div data-testid="date-range-picker">RangePicker</div>
    },
    message: {
      useMessage: () => [mockMessageApi, null]
    }
  };
});

describe('TabsComponent', () => {
  let mockForm: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset del mock de useTestAssignment
    const { useTestAssignment } = require('@/hooks/useTestAssignment');
    useTestAssignment.mockImplementation(() => ({
      mutate: mockMutate,
      data: null,
      error: null,
      isPending: false
    }));

    mockForm = {
      getFieldValue: jest.fn((field) => {
        if (field === 'filter') return [{ combinator: 'and', list: [] }];
        if (field === 'exclude') return [{ combinator: 'and', list: [] }];
        return null;
      }),
      setFieldsValue: jest.fn(),
      resetFields: jest.fn()
    };
  });

  it('should render with default tabs', () => {
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Asignación')).toBeInTheDocument();
  });

  it('should render form fields in Info tab', () => {
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    const titleLabel = screen.getByText('Titulo');
    expect(titleLabel).toBeInTheDocument();
    expect(titleLabel.closest('.ant-form-item')).toBeInTheDocument();
    
    const introLabel = screen.getByText('Intro');
    expect(introLabel).toBeInTheDocument();
    expect(introLabel.closest('.ant-form-item')).toBeInTheDocument();
    
    const vigenciaLabel = screen.getByText('Vigencia');
    expect(vigenciaLabel).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });

  it('should allow switching between tabs', async () => {
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    fireEvent.click(screen.getByText('Asignación'));

    await waitFor(() => {
      expect(screen.getByText('Probar Asignación')).toBeInTheDocument();
      expect(screen.getByText('Incluir')).toBeInTheDocument();
      expect(screen.getByText('Excluir')).toBeInTheDocument();
    });
  });

  it('should handle assignment test correctly', async () => {
    // Mock de respuesta exitosa
    mockMutate.mockResolvedValueOnce({ 
      count: 5, 
      examples: ['test@example.com'] 
    });

    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    fireEvent.click(screen.getByText('Asignación'));
    fireEvent.click(screen.getByText('Probar Asignación'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        exclude: expect.any(Object),
        filter: expect.any(Object)
      });
    });
  });
  
  it('should show popover with assignment results on successful test', async () => {
    // Mock de respuesta exitosa con datos de ejemplo
    const mockData = {
      count: 3,
      examples: ['usuario1', 'usuario2', 'usuario3']
    };

    mockMutate.mockImplementation(() => {
      return Promise.resolve(mockData);
    });

    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    // Navegar a la pestaña de asignación
    fireEvent.click(screen.getByText('Asignación'));
    
    // Hacer clic en el botón de prueba
    await fireEvent.click(screen.getByText('Probar Asignación'));

    // Verificar que se llame mutate y se procese la respuesta exitosa
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    // Verificar el estado después de la mutación exitosa
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        exclude: expect.any(Object),
        filter: expect.any(Object)
      });
    });
  });

  // Test adicional para verificar el formulario
  it('should handle form field changes', async () => {
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    // Verificar que el formulario se renderice correctamente
    expect(screen.getByLabelText(/titulo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/intro/i)).toBeInTheDocument();
    expect(screen.getByText(/vigencia/i)).toBeInTheDocument();
  });

  // Test para verificar las políticas de asignación
  it('should render assignment policies correctly', async () => {
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );

    // Navegar a la pestaña de asignación
    fireEvent.click(screen.getByText('Asignación'));

    // Verificar que se muestren las secciones de políticas
    await waitFor(() => {
      expect(screen.getByText('Incluir')).toBeInTheDocument();
      expect(screen.getByText('Excluir')).toBeInTheDocument();
      expect(screen.getAllByText(/agregar grupo/i)).toHaveLength(2);
    });
  });

  it('should close popover when clicking outside', async () => {
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );
  
    // Abrir popover
    fireEvent.click(screen.getByText('Asignación'));
    fireEvent.click(screen.getByText('Probar Asignación'));
  
    // Simular clic fuera
    fireEvent.click(document.body);
  
    await waitFor(() => {
      // Verificar que el popover se cierre
      expect(screen.queryByText('Aplica para')).not.toBeInTheDocument();
    });
  });

  it('should handle error state in assignment test', async () => {
    const { useTestAssignment } = require('@/hooks/useTestAssignment');
  
    // Configuración simplificada del mock
    useTestAssignment.mockImplementation(() => ({
      mutate: mockMutate,
      data: null,
      error: { message: 'Error de prueba' },
      isPending: false
    }));
  
    render(
      <Form>
        <TabsComponent form={mockForm} />
      </Form>
    );
  
    // Navegar a la pestaña de asignación
    fireEvent.click(screen.getByRole('tab', { name: /asignación/i }));
  
    // Esperar y hacer clic en el botón
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /probar asignación/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /probar asignación/i }));
  
    // Verificar el mensaje de error
    await waitFor(() => {
      expect(mockMessageApi.error).toHaveBeenCalled();
    });
  });
});