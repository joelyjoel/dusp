/*
  A base class for unit which process spectral data.
*/

const Unit = require("../../Unit.js")
const config = require("../../config")

class SpectralUnit extends Unit {
  constructor() {
    super()

    this.windowSize = config.fft.windowSize
    this.frameSize = this.windowSize * 2
    this.hopInterval = config.fft.hopSize
    this.tickInterval = this.hopInterval
  }

  addSpectralInlet(name, options={}) {
    options = Object.assign({}, options, {
      type: "spectral",
      chunkSize: this.frameSize,
    })
    this.addInlet(name, options)
  }
  addSpectralOutlet(name, options={}) {
    options = Object.assign({}, options, {
      type: "spectral",
      chunkSize: this.frameSize,
    })
    this.addOutlet(name, options)
  }
}
SpectralUnit.prototype.isSpectralUnit = true
module.exports = SpectralUnit
