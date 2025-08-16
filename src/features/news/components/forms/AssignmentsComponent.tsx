import React from "react";
import {
  Form,
  Input,
  Select,
  Card,
  Space,
  Button,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";

interface DynamicFieldProps {
    selectedField: string;
    subField: {
      name: number;
      key: number;
    };
  }
  
  const fieldOptions = [
    { label: "Código", value: "code" },
    { label: "Nombre", value: "first_name" },
    { label: "Apellido", value: "last_name" },
    { label: "Departamento", value: "memberships__department__id" },
    { label: "Rol", value: "memberships__role__id" },
    { label: "Campo extra", value: "extra_field_values__value" },
  ];
  
  const departmentOptions = [
    { label: "BI", value: "3" },
    { label: "Customer Success", value: "1" },
    { label: "Desarrollo", value: "4" },
    { label: "Insights", value: "5" },
    { label: "Soporte Técnico", value: "2" },
  ];
  
  const roleOptions = [
    { label: "KAM", value: "2" },
    { label: "Inplant", value: "3" },
    { label: "Gerente", value: "1" },
    { label: "Soporte Técnico", value: "4" },
    { label: "Testing", value: "5" },
    { label: "Promotor", value: "6" },
    { label: "Admin", value: "7" },
    { label: "Desarrollo", value: "8" },
    { label: "Desarrollo2", value: "9" },
  ];
  
  const extraOptions = [
    { label: "Zona", value: "1" },
    { label: "Promotor", value: "2" },
  ];
  
  const DynamicField = ({ selectedField, subField }: DynamicFieldProps) => {
    if (selectedField === fieldOptions[3].value || selectedField === fieldOptions[4].value) {
      return (
        <Form.Item
          messageVariables={{ selected : selectedField === fieldOptions[3].value ? fieldOptions[3].label : fieldOptions[4].label }}
          name={[subField.name, "value"]}
          rules={[{ required: true, message: "Campo '${selected}' requerido" }]}
          style={{ marginBottom: 3, width: 155 }}
        >
          <Select
            placeholder="Seleccionar opción"
            options={
              selectedField === fieldOptions[3].value ? departmentOptions : roleOptions
            }
          />
        </Form.Item>
      );
    } else if (selectedField === fieldOptions[5].value) {
      return (
        <div>
          <Form.Item
            name={[subField.name, "field_extra"]}
            style={{ marginBottom: 3}}
            rules={[{ required: true, message: "Campo exta requerido" }]}
          >
            <Select
              placeholder="Seleccionar campo"
              options={extraOptions}
            />
          </Form.Item>
          <Form.Item
            name={[subField.name, "value_extra"]}
            style={{ marginBottom: 3 }}
            rules={[{ required: true, message: "Campo extra requerido" }]}
          >
            <Input placeholder="Valor" autoComplete="off" />
          </Form.Item>
        </div>
      );
    }
    return (
      <Form.Item
        messageVariables={{ selected : selectedField === fieldOptions[0].value ? fieldOptions[0].label : 
          selectedField === fieldOptions[1].value ? fieldOptions[1].label : 
          selectedField === fieldOptions[2].value ? fieldOptions[2].label : 
          "Campo" }}
        name={[subField.name, "value"]}
        rules={[{ required: true, message: "Campo '${selected}'requerido" }]}
        style={{ marginBottom: 3 }}
      >
        <Input placeholder="Valor" autoComplete="off"/>
      </Form.Item>
    );
  };
  
  interface FilterGroupProps {
    form: FormInstance;
    name: string; // Este será el nombre de la lista para diferenciarlas (ej. "inclusion" o "exclusion")
  }
  
  export const AssignmentsComponent = ({ form, name }: FilterGroupProps) => (
    <Form.List // Form.List para manejar listas de campos
      name={name}
      initialValue={[{ combinator: "and", list: [] }]}
    >
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <Card // Card para agrupar los campos de cada item
              size="small"
              title={`Grupo ${field.name + 1}`}
              key={field.key}
              style={{ borderColor: "#d9d9d9" }}
              extra={
              <div className="flex flex-row gap-3">
                <Form.Item
                name={[field.name, "combinator"]}
                rules={[{ required: true, message: "Selecciona un operador" }]}
                initialValue="and"
                style={{ marginBottom: 0 }}
                >
                <Select
                  options={[
                  { label: "Y", value: "and" },
                  { label: "O", value: "or" },
                  ]}
                  size="small"
                  style={{ width: 48 }}
                />
                </Form.Item>
                {fields.length > 1 && (
                <CloseOutlined // Boton para eliminar el item Grupo
                  onClick={() => {
                  remove(field.name);
                  }}
                  style={{ marginLeft: 8 }}
                />
                )}
              </div>
              }
            >
              <Form.List name={[field.name, "list"]}>
                {(subFields, subOpt) => (
                  <div className="flex flex-col">
                    {subFields.map((subField) => (
                      <div key={subField.key} className="flex flex-row justify-between gap-1">
                        <Space.Compact size="small">
                          <Form.Item
                            name={[subField.name, "field"]}
                            initialValue={fieldOptions[0].value}
                            rules={[
                              { required: true, message: "Selecciona un campo" },
                            ]}
                            style={{ marginBottom: 3 }}
                          >
                            <Select
                              options={fieldOptions}
                              style={{ width: 132 }}
                              onChange={(value) => {
                                const newFilter = form.getFieldValue(name);
                                newFilter[field.name].list[subField.name] = {
                                  ...newFilter[field.name].list[subField.name],
                                  field: value,
                                  value: undefined,
                                  field_extra: undefined,
                                  value_extra: undefined,
                                };
                                form.setFieldsValue({ [name]: newFilter });
                              }}
                            />
                          </Form.Item>
                          <Form.Item name={[subField.name, "operator"]} initialValue={"="} style={{ marginBottom: 3 }}>
                            <Input disabled style={{width: 25}}/>
                          </Form.Item>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                              prevValues[name]?.[field.name]?.list?.[subField.name]?.field !==
                              currentValues[name]?.[field.name]?.list?.[subField.name]?.field
                            }
                          >
                            {({ getFieldValue }) => {
                              const selectedField = getFieldValue([
                                name,
                                field.name,
                                "list",
                                subField.name,
                                "field",
                              ]);
                              return (
                                <DynamicField
                                  selectedField={selectedField}
                                  subField={subField}
                                />
                              );
                            }}
                          </Form.Item>
                        </Space.Compact>
                        <CloseOutlined
                          className="self-start pt-2"
                          onClick={() => {
                            subOpt.remove(subField.name);
                            form.resetFields([
                              `${name}.${field.name}.list.${subField.name}`, 
                            ]);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => subOpt.add()}
                      style={{ marginTop: 10 }}
                      block
                      size="small"
                    >
                      + Agregar Regla
                    </Button>
                  </div>
                )}
              </Form.List>
            </Card>
          ))}
          <Button type="dashed" onClick={() => add({ combinator: "and", list: [] })} block size="small">
            + Agregar Grupo
          </Button>
        </div>
      )}
    </Form.List>
  );