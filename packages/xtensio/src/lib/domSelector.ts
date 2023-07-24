export function domSelector(query: (()=> Element | Promise<Element>) | string, wait: number = 10){
  return new Promise<Element | null>((resolve) => {
    let timeout: ReturnType<typeof setTimeout>;

    const observer = new MutationObserver(async () => {
      let el: Element | null = null;
      if(typeof query === "function") el = await Promise.resolve(query());
      else if(typeof query === "string") el = document.querySelector(query);
      if (el) {
        resolve(el);
        clearTimeout(timeout);
        observer.disconnect();
      }
    });

    timeout = setTimeout(async () => {
      let el: Element | null = null;
      // TODO remember to catch error from user executed DOM code here!
      if(typeof query === "function") el = await Promise.resolve(query());
      else if(typeof query === "string") el = document.querySelector(query);
      resolve(el);
      observer.disconnect();
    }, wait * 1000);

    observer.observe(document.body, { subtree: true, childList: true });
  });
}
