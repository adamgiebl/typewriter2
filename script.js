import Typewriter from "./Typewriter2.js";

const config = {
  volume: 0.5,
  speed: 1.1,
  randomness: 2,
  dingBeforeLineEnd: true,
};
const type = new Typewriter(config);
const start = () => {
  type.init();
  document.removeEventListener("click", start);
};
document.addEventListener("click", start);
