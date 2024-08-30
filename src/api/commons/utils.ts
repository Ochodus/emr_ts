import { produce } from "immer"

export const findElement = (array: Array<any> | undefined, targetIndex: number) => {
    return array?.find((_, index) => index === targetIndex)
}

export const openSidebar = () => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.setProperty('--SideNavigation-slideIn', '1');
    }
  }
  
  export const closeSidebar = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.removeProperty('--SideNavigation-slideIn');
      document.body.style.removeProperty('overflow');
    }
  }
  
  export const toggleSidebar = () => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const slideIn = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue('--SideNavigation-slideIn');
      if (slideIn) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }
  }
  
  export const prettyPrint = <T>(obj: T | null): string => {
    let primitiveTypes = ['string', 'number', 'boolean', 'symbol', 'undefined', 'bigint']
    if (!obj) return ""

    const formatObject = <K>(obj: K, indent: string = ''): string => {
      if (obj === null || obj === undefined) return ''
      return Object.keys(obj as object).map((keys) => {
        let value = obj[keys as keyof typeof obj]
        if (primitiveTypes.includes(typeof value)) return `${indent}${keys}: ${value}`
        else return `${indent}${keys}:\n${formatObject(obj[keys as keyof typeof obj], indent.concat('|  '))}`
      }).join('\n')
    };
  
    return formatObject(obj);
  };
  
  export const validationCheck = <T>(value: T, canEmpty: boolean = false, filter?: (value: T) => boolean): boolean=> {
    if (value === '' || value === undefined || value === null) return canEmpty
    if (typeof value === 'string' && !filter) return true
    if (filter) return filter(value)
    return Object.values(value as {}).map((value) => validationCheck<typeof value>(value, canEmpty, filter)).every(value => value)
}

export const updateInspection = <T, K>(
  draft: T, 
  targetPath: (string | number)[], 
  newValue: K
) => {
  if (targetPath.length === 1) {
      draft[targetPath[0] as (keyof T)] = newValue as T[keyof T]
  } else {
      let newDraft = draft[targetPath[0] as (keyof T)]
      updateInspection<typeof newDraft, K>(newDraft, targetPath.slice(1), newValue)
  }
}

export const updateDeepValue = <T, K>(setInspection: React.Dispatch<React.SetStateAction<T>> | undefined, targetPath: (string | number)[], newValue: K) => {
  if (!setInspection) return
  setInspection(prevObj =>
      (produce(prevObj, draft => {
          updateInspection<typeof draft, K>(draft, targetPath, newValue)
      }))
  )
}

export const findPrimitives = <T>(obj: T, path: string='') => {
  type primitive = string | number | boolean | null | undefined
  const results: {path: string, value: string | number | boolean | null | undefined}[] = [];

  for (const key in obj) {
    if ((obj as object).hasOwnProperty(key)) {
      const value = obj[key]
      const currentPath = path ? `${path}.${key}` : key

      if (value !== Object(value)) {
        results.push({ path: currentPath, value: value as primitive })
      } else {
        results.push(...findPrimitives(value, currentPath))
      }
    }
  }

  return results
}

export const preventOperand = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === '-' || e.key === '+') {
    e.preventDefault()
  }
}

export const preventExponential = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'e' || e.key === 'E') {
    e.preventDefault()
  }
}

export const preventFloat = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === '.') {
    e.preventDefault()
  }
}

export const preventAllNonDigit = (e: React.KeyboardEvent<HTMLInputElement>) => {
  preventOperand(e)
  preventExponential(e)
  preventFloat(e)
}

export const preventExpression = (e: React.KeyboardEvent<HTMLInputElement>) => {
  preventOperand(e)
  preventExponential(e)
}

