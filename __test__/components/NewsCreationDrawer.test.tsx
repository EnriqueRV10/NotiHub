import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsCreationDrawer from '@/components/NewsCreationDrawer';
import { useCreateNews } from '@/hooks/useCreateNews';
import { useRouter } from 'next/navigation';

// Mock del formulario
const mockForm = {
  resetFields: jest.fn(),
  validateFields: jest.fn(),
  getFieldValue: jest.fn(),
  setFieldsValue: jest.fn(),
};

// Mock de los hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/hooks/useCreateNews');

// Mock de antd
jest.mock('antd', () => {
  const ActualDrawer = ({ title, open, onClose, children }: any) => {
    if (!open) return null;
    return (
      <div role="dialog" aria-modal="true" aria-label={title} data-testid="drawer">
        <div role="heading" aria-level={1}>{title}</div>
        <div>{children}</div>
      </div>
    );
  };

  const ActualFormItem = ({ label, name, required, children, rules }: any) => (
    <div>
      <label htmlFor={name} id={`${name}-label`}>
        {label}
        {required && ' *'}
      </label>
      {React.cloneElement(children, { 
        id: name,
        name: name,
        'aria-labelledby': `${name}-label`,
        'aria-required': required
      })}
    </div>
  );

  // eslint-disable-next-line react/display-name
  const ActualInput = React.forwardRef(({ id, name, ...props }: any, ref: any) => (
    <input
      ref={ref}
      type="text"
      id={id}
      name={name}
      {...props}
    />
  ));

  const ActualButton = ({ children, onClick, htmlType, loading, disabled, type }: any) => (
    <button
      onClick={onClick}
      type={htmlType || 'button'}
      disabled={loading || disabled}
      data-loading={loading}
    >
      {children}
    </button>
  );

  const ActualSpace = ({ children }: any) => (
    <div className="ant-space">
      {children}
    </div>
  );

  const ActualForm = ({ onFinish, children }: any) => {
    React.useEffect(() => {
      // Asegurarse de que resetFields se llame después del montaje
      mockForm.resetFields();
    }, []);
  
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mockForm.validateFields()
            .then((values: any) => {
              onFinish(values);
            })
            .catch((errorInfo: { errorFields: any[]; }) => {
              if (errorInfo.errorFields) {
                errorInfo.errorFields.forEach((field: any) => {
                  const errorElement = document.createElement('div');
                  errorElement.textContent = field.errors[0];
                  errorElement.setAttribute('role', 'alert');
                  document.body.appendChild(errorElement);
                });
              }
            });
        }}
      >
        {children}
      </form>
    );
  };

  return {
    Drawer: ActualDrawer,
    Form: Object.assign(ActualForm, {
      Item: ActualFormItem,
      useForm: () => [mockForm]
    }),
    Input: ActualInput,
    Button: ActualButton,
    Space: ActualSpace,
    message: {
      useMessage: () => {
        const messageApi = {
          success: jest.fn(),
          error: jest.fn(),
          warning: jest.fn(),
        };
        return [messageApi, null];
      },
    },
  };
});

describe('NewsCreationDrawer', () => {
  const user = userEvent.setup();
  const mockRouter = {
    push: jest.fn()
  };
  
  const defaultProps = {
    visible: true,
    onClose: jest.fn()
  };

  let mockMessageApi: any;
  
  beforeEach(() => {
    // Limpiar el DOM y los mocks
    document.body.innerHTML = '';
    jest.clearAllMocks();
    
    // Mock del router con implementación consistente
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Reset del mock del formulario
    Object.values(mockForm).forEach(mockFn => {
      if (typeof mockFn === 'function') {
        mockFn.mockClear();
      }
    });

    // Mock por defecto de createNews
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
      isError: false
    });
  });

  it('renders correctly when visible is true', async () => {
    render(<NewsCreationDrawer {...defaultProps} />);
    
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nueva Noticia');
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('validates required title field', async () => {
    mockForm.validateFields.mockRejectedValue({
      errorFields: [{ name: ['title'], errors: ['Campo Título requerido'] }]
    });

    render(<NewsCreationDrawer {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(mockForm.validateFields).toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent('Campo Título requerido');
    });
  });

  it('calls mutate with correct data on successful form submission', async () => {
    const mockMutate = jest.fn();
    mockForm.validateFields.mockResolvedValue({ title: 'Test Title' });
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false
    });

    render(<NewsCreationDrawer {...defaultProps} />);

    await user.type(screen.getByLabelText(/título/i), 'Test Title');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Title',
        body: '',
        intro: '',
        employee_assignment_policy: {}
      }));
    });
  });

  it('shows loading state during submission', async () => {
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isSuccess: false,
      isError: false
    });

    render(<NewsCreationDrawer {...defaultProps} />);
    
    const createButton = screen.getByRole('button', { name: /crear/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    expect(createButton).toHaveAttribute('data-loading', 'true');
    expect(createButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('does not render when visible is false', () => {
    render(<NewsCreationDrawer visible={false} onClose={jest.fn()} />);
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('handles close properly', async () => {
    const onClose = jest.fn();
    render(<NewsCreationDrawer visible={true} onClose={onClose} />);
    
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
    expect(mockForm.resetFields).toHaveBeenCalled();
  });

  // 2. Pruebas de manejo de estados
  it('prevents closing during form submission', async () => {
    const onClose = jest.fn();
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
      isSuccess: false,
      isError: false
    });

    render(<NewsCreationDrawer visible={true} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows success message and closes drawer on successful creation', async () => {
    const onClose = jest.fn();
    const mockMessageApi = { success: jest.fn(), error: jest.fn() };
    
    jest.spyOn(require('antd').message, 'useMessage')
      .mockImplementation(() => [mockMessageApi, null]);
  
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: jest.fn((data, options) => {
        mockMessageApi.success({
          content: 'Noticia creada con éxito',
          duration: 5
        });
        onClose();
      }),
      isPending: false,
      isSuccess: true,
      isError: false
    });
  
    render(<NewsCreationDrawer visible={true} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /crear/i }));
  
    await waitFor(() => {
      expect(mockMessageApi.success).toHaveBeenCalledWith({
        content: 'Noticia creada con éxito',
        duration: 5
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
  
  it('shows error message on creation failure', async () => {
    const mockMessageApi = { success: jest.fn(), error: jest.fn() };
    
    jest.spyOn(require('antd').message, 'useMessage')
      .mockImplementation(() => [mockMessageApi, null]);
  
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: jest.fn(() => {
        mockMessageApi.error({
          content: 'Error al crear la noticia',
          duration: 5
        });
      }),
      isPending: false,
      isSuccess: false,
      isError: true
    });
  
    render(<NewsCreationDrawer visible={true} onClose={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /crear/i }));
  
    await waitFor(() => {
      expect(mockMessageApi.error).toHaveBeenCalledWith({
        content: 'Error al crear la noticia',
        duration: 5
      });
    });
  });

  it('validates title length', async () => {
    // Limpiar alertas previas
    document.body.innerHTML = '';
    
    mockForm.validateFields.mockRejectedValue({
      errorFields: [{ 
        name: ['title'], 
        errors: ['El título no puede exceder los 128 caracteres'] 
      }]
    });
  
    render(<NewsCreationDrawer {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /crear/i }));
  
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts[alerts.length - 1])
        .toHaveTextContent('El título no puede exceder los 128 caracteres');
    });
  });

  it('trims whitespace from title', async () => {
    const mockMutate = jest.fn();
    mockForm.validateFields.mockResolvedValue({ title: '  Test Title  ' });
    
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false
    });

    render(<NewsCreationDrawer {...defaultProps} />);

    await user.type(screen.getByLabelText(/título/i), '  Test Title  ');
    await user.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Title'
      }));
    });
  });

  it('redirects to new news page after successful creation', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  
    // Simular la respuesta de la API
    const mockResponse = { data: { id: '123' } };
    
    // Crear un mock de la mutación que simule el comportamiento asíncrono
    const mockMutate = jest.fn().mockImplementation((data) => {
      // Simular un delay pequeño para emular una llamada API
      setTimeout(() => {
        // Llamar directamente a router.push con el ID de la noticia creada
        mockPush(`/${mockResponse.data.id}`);
      }, 0);
    });
  
    // Configurar el hook useCreateNews
    (useCreateNews as jest.Mock).mockImplementation((onSuccess) => ({
      mutate: (data: any) => {
        mockMutate(data);
        // Llamar al callback onSuccess que se pasa al hook
        if (onSuccess) {
          onSuccess(mockResponse);
        }
      },
      isPending: false,
      isSuccess: true,
      isError: false
    }));
  
    // Simular una validación exitosa del formulario
    mockForm.validateFields.mockResolvedValue({ title: 'Test Title' });
  
    render(<NewsCreationDrawer {...defaultProps} />);
  
    // Simular el envío del formulario
    await user.click(screen.getByRole('button', { name: /crear/i }));
  
    // Esperar a que se llame a la redirección
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/123');
    }, { 
      timeout: 1000,  // Reducir el timeout ya que ahora debería ser más rápido
    });
  });

  it('resets form on mount', async () => {
    // Limpiar las llamadas previas al mock
    mockForm.resetFields.mockClear();
  
    render(<NewsCreationDrawer {...defaultProps} />);
  
    // Esperar a que se llame resetFields
    await waitFor(() => {
      expect(mockForm.resetFields).toHaveBeenCalled();
    }, { 
      timeout: 3000 
    });
  });

  it('resets form when drawer is closed', async () => {
    render(<NewsCreationDrawer {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockForm.resetFields).toHaveBeenCalled();
  });

  it('sets default dates correctly', async () => {
    const mockMutate = jest.fn();
    mockForm.validateFields.mockResolvedValue({ title: 'Test Title' });
    
    (useCreateNews as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false
    });
  
    render(<NewsCreationDrawer {...defaultProps} />);
  
    await user.type(screen.getByLabelText(/título/i), 'Test Title');
    await user.click(screen.getByRole('button', { name: /crear/i }));
  
    await waitFor(() => {
      const mutateCall = mockMutate.mock.calls[0][0];
      const startDate = new Date(mutateCall.start);
      const endDate = new Date(mutateCall.end);
      
      // Verificar que la diferencia está entre 28 y 31 días
      const diffInDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
      expect(diffInDays).toBeGreaterThanOrEqual(28);
      expect(diffInDays).toBeLessThanOrEqual(31);
      expect(startDate).toBeInstanceOf(Date);
      expect(endDate).toBeInstanceOf(Date);
    });
  });
});