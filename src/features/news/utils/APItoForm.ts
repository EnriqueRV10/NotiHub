type Operator = '=';

interface ApiRule {
  field: string;
  id: string;
  value: string | number | { field: number; value: string };
  operator: Operator;
}

interface ApiGroup {
  rules: (ApiRule | ApiGroup)[];
  id: string;
  combinator: 'and' | 'or';
}

interface ComponentRule {
  field: string;
  operator: Operator;
  value?: string;
  field_extra?: string;
  value_extra?: string;
}

interface ComponentGroup {
  combinator: 'and' | 'or';
  list: ComponentRule[];
}

export function convertApiToComponentFormat(apiData: ApiGroup): ComponentGroup[] {
  function convertRule(rule: ApiRule): ComponentRule {
    let convertedRule: ComponentRule = {
      field: rule.field,
      operator: rule.operator as '='
    };

    if (rule.field === 'extra_field_values__value' && typeof rule.value === 'object') {
      convertedRule.field_extra = rule.value.field.toString();
      convertedRule.value_extra = rule.value.value;
    } else {
      convertedRule.value = rule.value.toString();
    }

    return convertedRule;
  }

  function processRules(rules: (ApiRule | ApiGroup)[], parentCombinator: 'and' | 'or'): ComponentGroup[] {
    let result: ComponentGroup[] = [{ combinator: parentCombinator, list: [] }];
    let topLevelGroup = result[0]; // Mantener una referencia al grupo de nivel superior

    rules.forEach((rule) => {
      if ('rules' in rule) {
        // Procesar las reglas anidadas
        const nestedGroups = processRules(rule.rules, rule.combinator);
        
        // Agregar las reglas anidadas al grupo
        result.push(...nestedGroups);
      } else {
        // Convertir la regla y agregarla al grupo de nivel superior
        topLevelGroup.list.push(convertRule(rule));
      }
    });

    return result;
  }

  return processRules(apiData.rules, apiData.combinator);
}