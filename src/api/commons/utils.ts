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