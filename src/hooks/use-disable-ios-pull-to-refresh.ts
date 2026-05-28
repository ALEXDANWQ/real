import { useEffect } from "react";

const IOS_DEVICE_REGEX = /iPad|iPhone|iPod/;
const TOP_EPSILON = 1;

const isIOSDevice = () =>
  IOS_DEVICE_REGEX.test(window.navigator.userAgent) ||
  (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

const isScrollableElement = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  const overflowY = styles.overflowY;
  const allowsScroll = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
  return allowsScroll && element.scrollHeight > element.clientHeight;
};

const getScrollableAncestor = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof Element)) return null;

  let current: Element | null = target;
  while (current && current !== document.body) {
    if (current instanceof HTMLElement && isScrollableElement(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
};

const getRootScrollTop = () => {
  const root = document.scrollingElement;
  if (root) return root.scrollTop;
  return window.scrollY || document.documentElement.scrollTop || 0;
};

export function useDisableIosPullToRefresh() {
  useEffect(() => {
    if (typeof window === "undefined" || !isIOSDevice()) return;

    let touchStartY = 0;
    let touchStartX = 0;
    let activeTouchId: number | null = null;
    let activeScrollable: HTMLElement | null = null;

    const resetGesture = () => {
      activeTouchId = null;
      activeScrollable = null;
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        resetGesture();
        return;
      }

      const touch = event.touches[0];
      activeTouchId = touch.identifier;
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      activeScrollable = getScrollableAncestor(event.target);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;

      const touch =
        activeTouchId === null
          ? event.touches[0]
          : Array.from(event.touches).find((item) => item.identifier === activeTouchId) ?? event.touches[0];

      const currentY = touch.clientY;
      const currentX = touch.clientX;
      const deltaY = currentY - touchStartY;
      const deltaX = currentX - touchStartX;
      const isVerticalPull = deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX);
      if (!isVerticalPull) return;

      const rootAtTop = getRootScrollTop() <= TOP_EPSILON;
      const scrollableAtTop = !activeScrollable || activeScrollable.scrollTop <= TOP_EPSILON;
      if (!rootAtTop || !scrollableAtTop) return;

      if (event.cancelable) {
        event.preventDefault();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", resetGesture, { passive: true, capture: true });
    window.addEventListener("touchcancel", resetGesture, { passive: true, capture: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("touchend", resetGesture, true);
      window.removeEventListener("touchcancel", resetGesture, true);
    };
  }, []);
}
