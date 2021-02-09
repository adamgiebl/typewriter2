import AudioController from "./AudioController.js";

class Typewriter {
  constructor({ volume = 0.3, speed = 2, randomness = 0 }) {
    this.elems = [...document.querySelectorAll(".typewritten")];

    this.texts = this.getArrayOfFormattedTexts(this.elems);

    this.eraseOriginalTexts(this.elems);
    this.mappedTexts;
    this.texts.forEach((text, index) =>
      this.mapWordsIntoDivsAndAppend(text, index)
    );
    this.noOfTexts = this.texts.length;
    this.textIndex = 0;

    this.muted = false;
    this.volume = volume;
    this.audioController = new AudioController(this.volume);
    this.speed = 80 * speed;
    this.randomness = 20 * randomness;
  }
  init() {
    this.audioContext = new AudioContext();
    this.gainNodeFx = this.audioContext.createGain();
    this.gainNodeFx.gain.value = this.volume;
    this.audioController.init().then(() => {
      this.writeOneTextElement(this.elems[this.textIndex]);
    });
  }
  getArrayOfFormattedTexts(elements) {
    return elements.map((el) => {
      return el.innerHTML
        .replace(/(.)(<br>)/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim();
    });
  }
  eraseOriginalTexts(elements) {
    elements.forEach((el) => {
      el.innerHTML = "";
    });
  }
  mapWordsIntoDivsAndAppend(text, index) {
    let splitText = text.split(" ");
    let mapped = splitText.map((word) => {
      if (word === "<br>") {
        const br = document.createElement("br");
        return br;
      }
      const letters = [...word].map((l) => {
        const span = document.createElement("span");
        span.textContent = l;
        span.classList.add("hidden");
        return span;
      });
      const div = document.createElement("div");
      div.dataset.count = word.length + 1;
      div.classList.add("word");
      const spanForSpace = document.createElement("span");
      spanForSpace.innerHTML = "&nbsp;";
      spanForSpace.classList.add("hidden", "space");
      div.append(...letters, spanForSpace);
      return div;
    });

    this.elems[index].append(...mapped);

    // after appending, we determine each last word on a line
    mapped.forEach((word, index) => {
      if (word.offsetTop !== mapped[index - 1]?.offsetTop && index !== 0) {
        const previousWord = mapped[index - 1];
        // don't add last attribute on break tags or the words before them
        if (previousWord.nodeName !== "BR" && word.nodeName !== "BR") {
          previousWord.dataset.last = "true";
        }
      }
    });
  }
  writeOneTextElement(paragraph) {
    let wordIndex = 0;
    const words = paragraph.childNodes;

    const handleWord = () => {
      let letterIndex = 0;
      const word = words[wordIndex];
      const letters = word.childNodes;

      const showLetter = () => {
        const pseudoRandomDelay = this.getDelay();
        const letter = letters[letterIndex];
        if (letter?.classList) letter.classList.remove("hidden");
        this.playSound(letter, letterIndex);
        letterIndex++;

        if (letterIndex < letters.length) {
          if (letterIndex === letters.length - 1 && word.dataset.last) {
            this.audioController.playAudio("lastKey");
            return setTimeout(() => {
              showLetter();
            }, 1500 + this.speed);
          } else {
            return setTimeout(() => {
              showLetter();
            }, this.speed + pseudoRandomDelay);
          }
        } else {
          wordIndex++;
          if (wordIndex < words.length) {
            if (word.nodeName === "BR") {
              this.audioController.playAudio("return");
              setTimeout(() => {
                handleWord();
              }, 1000 + this.speed);
            } else {
              handleWord();
            }
          } else {
            this.textIndex++;
            if (this.textIndex < this.elems.length) {
              this.audioController.playAudio("return");
              setTimeout(() => {
                this.writeOneTextElement(this.elems[this.textIndex]);
              }, 1000 + this.speed);
            }
          }
        }
      };
      showLetter();
    };
    handleWord();
  }
  playSound(letter, letterIndex = 0) {
    if (letter?.classList.contains("space")) {
      this.audioController.playAudio("space");
    } else {
      letterIndex % 2 === 0
        ? this.audioController.playAudio("key1")
        : this.audioController.playAudio("key2");
    }
  }
  getDelay() {
    const multiplier = Math.random() < 0.5 ? -1 : 1;
    return Math.random() * this.randomness * multiplier;
  }
}

export default Typewriter;
