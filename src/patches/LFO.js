import Patch from "../Patch.js"
import Osc from "../components/Osc"
import Multiply from "../components/Multiply.js"
import Sum from "../components/Sum.js"

class LFO extends Unit {
  constructor(frequency, amplitude, origin, waveform) {
    super()

    var osc1 = new Osc()
    this.alias(osc1.F)
    this.osc = osc1

    var mult1 = new Multiply(osc1.OUT)
    this.alias(mult1.B, "a")

    var location = new Sum(mult1.OUT)
    this.alias(location.B, "o")
    this.alias(location.OUT)

    this.addUnits(
      osc1, mult1, location
    )

    this.F = frequency || 1
    this.A = amplitude || 1/2
    this.O = origin || 1/2
    this.waveform = waveform || "sine"
  }

  static randomInRange(maxF, minMin, maxMax, waveform) {
    var a = minMin + (maxMax-minMin) * Math.random()
    var b = minMin + (maxMax-minMin) * Math.random()
    if(a > b) {
      var max = a
      var min = b
    } else {
      var max = b
      var min = a
    }

    return new LFO(
      Math.random()*maxF,
      (min + max)/2,
      Math.random() * (max-min),
      waveform,
    )
  }

  get waveform() {
    return this.osc.waveform
  }
  set waveform(waveform) {
    this.osc.waveform = waveform
  }
}
export default LFO
