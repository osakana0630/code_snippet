import {useEffect} from "react";
import {usePathname} from "next/navigation";

const SCROLL_DEBOUNCE_TIME = 100;
const SCROLL_RESTORE_DELAY = 180;

type Params = {
  onBeforeRestore?: () => void
}
export const useScrollRestoration = (params: Params = {}) => {
  const {onBeforeRestore} = params
  const pathname = usePathname()
  const sessionKey = `${pathname}_scrollYPosition`
  
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    }
  })
  
  useEffect(() => {
    const scrollPosition = sessionStorage.getItem(sessionKey);
    onBeforeRestore?.()
    if (scrollPosition) {
      // レイアウトシフトを待って、スクロール復元処理を実行
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition))
      }, SCROLL_RESTORE_DELAY)
    }
    
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      // スクロール位置をセッションストレージに保存します。
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        sessionStorage.setItem(sessionKey, window.scrollY.toString());
      }, SCROLL_DEBOUNCE_TIME);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onBeforeRestore, sessionKey]);
}