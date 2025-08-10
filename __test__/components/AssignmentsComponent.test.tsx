import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form } from "antd";
import { AssignmentsComponent } from "@/components/AssignmentsComponent";

const TestWrapper = ({
  onFormReady,
}: {
  onFormReady?: (form: any) => void;
}) => {
  const [form] = Form.useForm();
  React.useEffect(() => {
    if (onFormReady) {
      onFormReady(form);
    }
  }, [form, onFormReady]);

  return (
    <Form form={form}>
      <AssignmentsComponent form={form} name="filter" />
    </Form>
  );
};

describe("AssignmentsComponent", () => {
  const user = userEvent.setup();

  it("renders without crashing and shows initial group", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Grupo 1")).toBeInTheDocument();
    expect(screen.getByText("+ Agregar Regla")).toBeInTheDocument();
  });

  it("allows adding a new rule", async () => {
    render(<TestWrapper />);
    await user.click(screen.getByText("+ Agregar Regla"));

    await waitFor(() => {
      expect(screen.getByTitle("Código")).toBeInTheDocument();
    });
  });

  it("updates field options when selecting different field types", async () => {
    render(<TestWrapper />);
    await user.click(screen.getByText("+ Agregar Regla"));

    // Esperar a que el primer selector esté disponible
    await waitFor(() => {
      expect(screen.getByText("Código")).toBeInTheDocument();
    });

    // Abrir el selector y seleccionar Departamento
    const fieldSelect = screen.getByText("Código");
    await user.click(fieldSelect);

    await waitFor(() => {
      expect(screen.getByTitle("Departamento")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Departamento"));

    // Esperar a que el valor se actualice
    await waitFor(() => {
      const departmentSelect = screen.getByText("Seleccionar opción");
      expect(departmentSelect).toBeInTheDocument();
    });
  });

  it("handles extra field values correctly", async () => {
    render(<TestWrapper />);
    await user.click(screen.getByText("+ Agregar Regla"));

    await waitFor(() => {
      expect(screen.getByText("Código")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Código"));
    await user.click(screen.getByText("Campo extra"));

    await waitFor(() => {
      expect(screen.getByText("Seleccionar campo")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Valor")).toBeInTheDocument();
    });
  });

  it("allows removing a rule", async () => {
    render(<TestWrapper />);
    await user.click(screen.getByText("+ Agregar Regla"));
    await user.click(screen.getByLabelText("close"));

    await waitFor(() => {
      expect(screen.queryByText("=")).not.toBeInTheDocument();
    });
  });

  it("handles group operations", async () => {
    render(<TestWrapper />);
    await user.click(screen.getByText("+ Agregar Grupo"));

    await waitFor(() => {
      expect(screen.getByText("Grupo 2")).toBeInTheDocument();
    });

    // Eliminar grupo
    const closeButtons = screen.getAllByLabelText("close");
    await user.click(closeButtons[closeButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByText("Grupo 2")).not.toBeInTheDocument();
    });
  });

  it("allows changing combinators", async () => {
    render(<TestWrapper />);
    await user.click(screen.getByText("Y"));

    await waitFor(() => {
      expect(screen.getByText("O")).toBeInTheDocument();
    });
  });
});
