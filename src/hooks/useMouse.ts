import { shallowRef } from "vue";
import { throttle } from "lodash-es";
function useMouse(throttleTime = 150) {
  const x = shallowRef(0);
  const y = shallowRef(0);
  window.addEventListener(
    "mousemove",
    throttle((e) => {
      x.value = e.pageX;
      y.value = e.pageY;
    }, throttleTime)
  );
  return {
    x,
    y,
  };
}
export default useMouse;
