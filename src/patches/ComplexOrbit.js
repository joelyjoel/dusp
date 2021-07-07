import Patch from "../Patch.js"
import CircularMotion from "../components/vector/CircularMotion.js"
import Multiply from "../components/Multiply.js"
import Repeater from "../components/Repeater.js"

class ComplexOrbit extends Unit {
  constructor( frequencyRatios, radiusRatios, centre) {
    super()

    var n
    frequencyRatios = frequencyRatios || 4
    if(frequencyRatios.constructor == Number) {
      n = frequencyRatios
      radiusRatios = []
      for(var i=0; i<n; i++)
        frequencyRatios[i] = Math.random()
    }
    n = frequencyRatios.length

    this.addUnits(
      this.frequencyRepeater = new Repeater(),
      this.radiusRepeater = new Repeater(),
    )

    radiusRatios = radiusRatios || []
    if(radiusRatios.constructor == Number) {
      var rMax = radiusRatios
      radiusRatios = []
    } else
      rMax = 1
    var current, last
    this.circs = []
    for(var i=0; i<n; i++) {
      radiusRatios[i] = radiusRatios[i] || rMax * Math.random()

      current = new CircularMotion()
      current.CENTRE = last ? last.OUT : [0,0];
      current.F = new Multiply(frequencyRatios[i], this.frequencyRepeater)
      current.RADIUS = new Multiply(radiusRatios[i], this.radiusRepeater)
      current.phase = Math.random() * Math.PI * 2

      this.circs[i] = current
      this.addUnit(current)
      last = current
    }

    this.frequencyRatios = frequencyRatios
    this.radiusRatios = radiusRatios

    this.aliasInlet(this.circs[0].CENTRE)
    this.aliasInlet(this.frequencyRepeater.IN, "f")
    this.aliasInlet(this.radiusRepeater.IN, "r")
    this.aliasOutlet(last.OUT)


    this.CENTRE = centre || [0,0]
    this.F = 1
    this.R = 1
  }

  static random(n, fMax, rMax, oMax) {
    n = n || 5
    fMax = fMax || 1
    rMax = rMax || 1
    oMax = oMax || 0

    var radiusRatios = []
    var frequencyRatios = []
    for(var i=0; i<n; i++) {
      radiusRatios[i] = Math.random()*rMax
      frequencyRatios[i] = Math.random()*fMax
    }
    var centre = [
      oMax * (Math.random()*2-1),
      oMax * (Math.random()*2-1),
    ]

    return new ComplexOrbit( frequencyRatios, radiusRatios, centre)
  }
}
export default ComplexOrbit
