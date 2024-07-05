export const findElement = (array: Array<any> | undefined, targetIndex: number) => {
    return array?.find((_, index) => index === targetIndex)
}

export const birthToId = (birth: string | undefined) => {
    if (birth && birth.substr(2)) return birth.substr(2).replace(/-/g, "")
    else return ""
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
  