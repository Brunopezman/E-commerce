import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginModal } from '../components/auth/LoginModal';

// ── Mock useAuth ────────────────────────────────────────────────────────

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: vi.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

// ── Helper to render the modal ──────────────────────────────────────────

function renderModal(isOpen = true, onClose = vi.fn()) {
  return render(<LoginModal isOpen={isOpen} onClose={onClose} />);
}

describe('LoginModal — Modo Login (comportamiento existente)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando isOpen=false', () => {
    const { container } = renderModal(false);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza el título "Iniciar Sesión"', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('renderiza los campos email y password', () => {
    renderModal();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('renderiza el botón "Iniciar Sesión"', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('muestra el disclaimer de login demostrativo', () => {
    renderModal();
    expect(screen.getByText('* Login demostrativo (sin validación real)')).toBeInTheDocument();
  });

  it('renderiza el link para crear cuenta', () => {
    renderModal();
    expect(screen.getByText('¿No tenés cuenta? Crear una')).toBeInTheDocument();
  });

  it('llama a login con email y password al submit exitoso', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal(true, onClose);

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra error si login lanza una excepción', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas.'));
    const user = userEvent.setup();

    renderModal();

    await user.type(screen.getByLabelText('Correo electrónico'), 'bad@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas.')).toBeInTheDocument();
    });
  });

  it('muestra error si email o password están vacíos', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByText('Email y contraseña son obligatorios.')).toBeInTheDocument();
    });
  });

  it('deshabilita inputs y botón durante loading', async () => {
    // Make login never resolve so we can check loading state
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();

    renderModal();

    await user.type(screen.getByLabelText('Correo electrónico'), 'a@b.com');
    await user.type(screen.getByLabelText('Contraseña'), 'pass');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeDisabled();
      expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
      expect(screen.getByLabelText('Contraseña')).toBeDisabled();
    });
  });
});

describe('LoginModal — Toggle entre modos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cambia a modo registro al hacer clic en "¿No tenés cuenta? Crear una"', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Ya tengo cuenta, iniciar sesión')).toBeInTheDocument();
  });

  it('vuelve a modo login al hacer clic en "Ya tengo cuenta, iniciar sesión"', async () => {
    const user = userEvent.setup();
    renderModal();

    // Switch to register
    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();

    // Switch back to login
    await user.click(screen.getByText('Ya tengo cuenta, iniciar sesión'));
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByText('¿No tenés cuenta? Crear una')).toBeInTheDocument();
  });

  it('resetea errores y campos al togglear modos', async () => {
    const user = userEvent.setup();
    renderModal();

    // Trigger login error
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    await waitFor(() => {
      expect(screen.getByText('Email y contraseña son obligatorios.')).toBeInTheDocument();
    });

    // Switch to register — error should be gone
    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));
    expect(screen.queryByText('Email y contraseña son obligatorios.')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });
});

describe('LoginModal — Modo Registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza todos los campos del formulario de registro', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Apellido/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Correo electrónico/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirmar contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
    expect(screen.getByLabelText('Código Postal')).toBeInTheDocument();
    expect(screen.getByLabelText('Sexo')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
  });

  it('no muestra el disclaimer de login demostrativo en modo registro', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    expect(screen.queryByText('* Login demostrativo (sin validación real)')).not.toBeInTheDocument();
  });

  it('muestra error inline si Nombre está vacío al submit', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));
    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    });
  });

  it('muestra error inline si Apellido está vacío al submit', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));
    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El apellido es obligatorio.')).toBeInTheDocument();
    });
  });

  it('muestra error si email tiene formato inválido', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'email-invalido');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Formato de email inválido.')).toBeInTheDocument();
    });
  });

  it('muestra error si contraseña tiene menos de 6 caracteres', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '12345');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '12345');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    });
  });

  it('muestra error si confirmar contraseña no coincide', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '654321');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    });
  });

  it('llama a register con datos correctos y cierra el modal en éxito', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderModal(true, onClose);

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Siempre Viva 123');
    await user.type(screen.getByLabelText('Código Postal'), '1000');
    await user.type(screen.getByLabelText('Teléfono'), '123456789');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'juan@test.com',
        '123456',
        {
          name: 'Juan',
          apellido: 'Pérez',
          address: 'Av. Siempre Viva 123',
          codigoPostal: '1000',
          sexo: undefined,
          telefono: '123456789',
        },
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a register con sexo seleccionado', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    renderModal(true, onClose);

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Ana');
    await user.type(screen.getByLabelText(/^Apellido/), 'García');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'ana@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.selectOptions(screen.getByLabelText('Sexo'), 'Femenino');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'ana@test.com',
        '123456',
        expect.objectContaining({ sexo: 'Femenino' }),
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra error general si register lanza excepción', async () => {
    mockRegister.mockRejectedValueOnce(new Error('El email ya está registrado.'));
    const user = userEvent.setup();

    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'existente@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado.')).toBeInTheDocument();
    });
  });

  it('limpia errores de campo al escribir en el input', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    // Trigger validation error on name
    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));
    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    });

    // Start typing to clear the error
    const nameInput = screen.getByLabelText(/^Nombre/);
    await user.type(nameInput, 'J');

    await waitFor(() => {
      expect(screen.queryByText('El nombre es obligatorio.')).not.toBeInTheDocument();
    });
  });

  it('deshabilita inputs y botón durante el loading del registro', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();

    renderModal();

    await user.click(screen.getByText('¿No tenés cuenta? Crear una'));

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeDisabled();
      expect(screen.getByLabelText(/^Nombre/)).toBeDisabled();
      expect(screen.getByLabelText(/^Apellido/)).toBeDisabled();
    });
  });
});
