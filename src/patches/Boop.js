import Patch from "../Patch.js"
import Shape from "../components/Shape"
import Osc from "../components/Osc"
import Multiply from "../components/Multiply.js"

class Boop extends Patch {
  constructor(f, duration) {
    super()
    this.addUnits(
      this.osc = new Osc(f),
      this.envelope = new Shape("decay", duration).trigger(),
      this.mult = new Multiply(this.osc, this.envelope)
    )

    this.envelope.onFinish = () => {
      this.finish()
    }

    this.aliasOutlet(this.mult.OUT)
  }

  trigger() {
    this.envelope.trigger()
  }
  stop() {
    this.envelope.stop()
  }
}
export default Boop
