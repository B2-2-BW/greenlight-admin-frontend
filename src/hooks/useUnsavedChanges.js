import { useCallback, useEffect } from 'react';

const MESSAGE = '저장하지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?';

export function useUnsavedChanges(isDirty) {
  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const handleDocumentClick = (event) => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.target === '_blank' || event.defaultPrevented) return;
      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (
        destination.origin === current.origin &&
        `${destination.pathname}${destination.search}` !== `${current.pathname}${current.search}` &&
        !window.confirm(MESSAGE)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isDirty]);

  return useCallback(() => !isDirty || window.confirm(MESSAGE), [isDirty]);
}
