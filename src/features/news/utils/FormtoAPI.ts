import { v4 as uuidv4 } from 'uuid';

interface ApiRule {
  field: string;
  id: string;
  value: string | number | { field: number; value: string };
  operator: '=';
}

interface ApiGroup {
  rules: (ApiRule | ApiGroup)[];
  id: string;
  combinator: 'and' | 'or';
}

interface ComponentRule {
  field: string;
  operator: '=';
  value?: string;
  field_extra?: string;
  value_extra?: string;
}

interface ComponentGroup {
  combinator: 'and' | 'or';
  list: ComponentRule[];
}

export function convertComponentToApiFormat(componentData: ComponentGroup[]): ApiGroup {
  if (!componentData || componentData.length === 0) {
    return {
      rules: [],
      id: `g-${uuidv4()}`,
      combinator: 'and'
    };
  }

  function convertRule(rule: ComponentRule): ApiRule {
    let apiRule: ApiRule = {
      field: rule.field,
      id: `r-${uuidv4()}`,
      value: rule.value || '',
      operator: '='
    };

    if (rule.field === 'extra_field_values__value' && rule.field_extra && rule.value_extra) {
      apiRule.value = {
        field: parseInt(rule.field_extra),
        value: rule.value_extra
      };
    } else if (rule.value) {
      if (['memberships__department__id', 'memberships__role__id'].includes(rule.field)) {
        apiRule.value = parseInt(rule.value);
      } else {
        apiRule.value = rule.value;
      }
    }

    return apiRule;
  }

  function processGroups(groups: ComponentGroup[]): ApiGroup {
    const mainGroup: ApiGroup = {
      rules: [],
      id: `g-${uuidv4()}`,
      combinator: groups[0].combinator
    };

    let currentGroup = mainGroup;

    groups.forEach((group, index) => {
      const apiRules = group.list.map(convertRule);
      
      if (index === 0) {
        // Para el primer grupo, añadimos las reglas directamente al grupo principal
        currentGroup.rules.push(...apiRules);
      } else {
        // Para los grupos subsiguientes, creamos un subgrupo y lo anidamos
        const subGroup: ApiGroup = {
          rules: apiRules,
          id: `g-${uuidv4()}`,
          combinator: group.combinator
        };
        currentGroup.rules.push(subGroup);
        currentGroup = subGroup;
      }
    });

    return mainGroup;
  }

  return processGroups(componentData);
}